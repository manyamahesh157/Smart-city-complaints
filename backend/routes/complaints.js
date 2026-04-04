const express = require('express');
const router = express.Router();
const { Complaint, ComplaintLog } = require('../models/Schemas');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Import AI Agent logic
const {
  classificationAgent,
  priorityAgent,
  verificationAgent,
  routingAgent,
  speechToTextAgent
} = require('../agents/aiAgents');

/**
 * @route POST /api/complaints
 * @desc Create a new complaint (triggers AI processing pipeline)
 * @access Public / Authenticated Citizen
 */
router.post('/', upload.fields([
  { name: 'voiceMemo', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), async (req, res) => {
  try {
    let title = req.body.title || 'Auto-generated Title';
    let description = req.body.description || '';
    let imageUrl = req.body.imageUrl;
    let voiceText = '';

    // Handle formData nested location fields sent by the frontend
    let parsedLocation = {
      latitude: req.body['location[latitude]'] ? parseFloat(req.body['location[latitude]']) : undefined,
      longitude: req.body['location[longitude]'] ? parseFloat(req.body['location[longitude]']) : undefined
    };

    // If sent as a stringified JSON (fallback)
    if (req.body.location && typeof req.body.location === 'string') {
      try {
        const parsed = JSON.parse(req.body.location);
        parsedLocation = { ...parsedLocation, ...parsed };
      } catch (e) {}
    }

    // 0. Speech-To-Text Agent - Transcribe if audio uploaded
    if (req.files && req.files['voiceMemo']) {
      voiceText = await speechToTextAgent(req.files['voiceMemo'][0].path);
      description = description ? `${description} (Voice Transcript: ${voiceText})` : `(Voice Transcript: ${voiceText})`;
    }
    
    // Check if an image was uploaded
    if (req.files && req.files['image']) {
      imageUrl = req.files['image'][0].path; // Mapping relative file system path
    }

    // Ensure description meets minimum length if relying purely on rules fallback in verification agent
    if (!description || description.trim() === '') {
       description = 'This is an auto-generated description for a multi-modal complaint submission.';
    }

    // 1. Verification Agent - check for spam and duplicates
    const verificationData = await verificationAgent({ title, description, imageUrl, location: parsedLocation });

    let category, priority, route;

    if (verificationData.isSpam) {
      category = 'fake';
      priority = 'rejected';
      route = { mappedDeptStr: 'none', status: 'blocked' };
    } else {
      // 2. Classification Agent - determine category
      category = await classificationAgent(description);

      // 3. Priority Agent - assess severity
      priority = await priorityAgent(description, category, parsedLocation);

      // 4. Routing Agent - map to corresponding authoritative department
      route = await routingAgent(category, parsedLocation);
    }

    // 5. Database Commit
    const newComplaint = new Complaint({
       title,
       description,
       location: parsedLocation,
       imageUrl,
       voiceText,
       category,
       priority,
       status: verificationData.isSpam ? 'rejected' : 'submitted' 
    });

    const savedComplaint = await newComplaint.save();

    // 6. Log Transaction
    await new ComplaintLog({
       complaintId: savedComplaint._id,
       status: verificationData.isSpam ? 'rejected' : 'submitted',
       remarks: verificationData.isSpam ? `Auto-Processed: Blocked as spam. Verified score: ${verificationData.similarityScore}` : `Auto-Processed: Categorized as ${category}, flagged as ${priority} priority. Verified score: ${verificationData.similarityScore}`
    }).save();

    // 7. Emit Real-time Update via WebSockets
    const io = req.app.get('socketio');
    if (io) {
      io.emit('new_complaint_ai_processed', {
         id: savedComplaint._id,
         category: savedComplaint.category,
         priority: savedComplaint.priority,
         location: parsedLocation,
         status: savedComplaint.status
      });
    }

    if (verificationData.isSpam) {
      return res.status(403).json({ 
        success: false, 
        msg: 'Submission blocked due to policy violations or spam detection.',
        data: savedComplaint 
      });
    }

    res.status(201).json({
      success: true,
      data: savedComplaint,
      ai_insights: {
        category,
        priority,
        verificationData,
        routeAction: route
      }
    });

  } catch (error) {
    console.error('Submission Error:', error);
    res.status(500).json({ success: false, msg: 'Server error processing complaint' });
  }
});

/**
 * @route GET /api/complaints
 * @desc Get all complaints (For Admins / Authority Dashboards)
 * @access Admin
 */
router.get('/', async (req, res) => {
  try {
    // Optionally implement generic filtering logic via req.query
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

/**
 * @route GET /api/complaints/:id
 * @desc Track specific complaint status
 * @access Public / Citizen
 */
router.get('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, msg: 'Complaint ID not found' });
    
    // Fetch logs
    const logs = await ComplaintLog.find({ complaintId: complaint._id }).sort({ timestamp: 1 });
    
    res.json({ success: true, data: complaint, history: logs });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Server Error' });
  }
});

/**
 * @route PUT /api/complaints/:id/status
 * @desc Update complaint status (For Authorities only)
 * @access Authority
 */
router.put('/:id/status', async (req, res) => {
  try {
     const { status, remarks, updatedBy } = req.body;
     const complaint = await Complaint.findByIdAndUpdate(
       req.params.id, 
       { status, updatedAt: Date.now() }, 
       { new: true }
     );
     
     if(complaint) {
       await new ComplaintLog({ complaintId: complaint._id, status, remarks, updatedBy }).save();
       
       // Emit socket event for authorities to track live
       const io = req.app.get('socketio');
       if (io) io.emit('complaint_status_changed', { id: complaint._id, status });

       res.json({ success: true, data: complaint });
     } else {
       res.status(404).json({ success: false, msg: 'Complaint not found' });
     }
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Internal Error' });
  }
});


module.exports = router;
