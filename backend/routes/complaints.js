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
  speechToTextAgent,
  visionProcessingAgent
} = require('../agents/aiAgents');

const { User } = require('../models/Schemas');

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
    if (verificationData.authenticityScore < 40 || verificationData.isSpam) {
      const io = req.app.get('socketio');
      if (io) {
         io.emit('new_complaint_ai_processed', {
            id: 'FAKE-' + Date.now().toString().slice(-4),
            category: 'Spam / Fake Detected',
            priority: 'Rejected',
            location: parsedLocation,
            status: 'rejected'
         });
      }
      return res.status(403).json({ success: false, msg: 'Submission blocked: Authenticity Score extremely low (' + verificationData.authenticityScore + ').' });
    }

    // 2. Classification Agent - determine category
    const category = await classificationAgent(description);

    // 3. Priority Agent - assess severity
    const priority = await priorityAgent(description, category, parsedLocation);

    // 4. Routing Agent - map to corresponding authoritative department
    const route = await routingAgent(category, parsedLocation);

    // 4.5 Vision Processing Agent - Estimate damage parameters if image exists
    let aiCostEstimate = 'Pending Image Upload';
    let aiDamageDimensions = 'N/A';
    if (imageUrl) {
      const visionResult = await visionProcessingAgent(imageUrl, category);
      aiCostEstimate = visionResult.aiCostEstimate;
      aiDamageDimensions = visionResult.aiDamageDimensions;
    }

    // 5. Database Commit
    const ticketId = 'TKT-' + Date.now().toString().slice(-6) + Math.random().toString(36).substring(2, 5).toUpperCase();

    const newComplaint = new Complaint({
       userId: req.user ? req.user.id : null, // If submitted authenticated
       ticketId,
       authenticityScore: verificationData.authenticityScore,
       title,
       description,
       location: parsedLocation,
       imageUrl,
       voiceText,
       category: route.mappedDeptStr || category,
       priority,
       aiCostEstimate,
       aiDamageDimensions,
       status: 'submitted' 
       // Optionally map mappedDept directly via ObjectID lookup: departmentAssigned: route.mappedDeptId
    });

    const savedComplaint = await newComplaint.save();

    // 6. Log Transaction
    await new ComplaintLog({
       complaintId: savedComplaint._id,
       status: 'submitted',
       remarks: `Auto-Processed: Categorized as ${category}, flagged as ${priority} priority. Verified score: ${verificationData.similarityScore}`
    }).save();

    // 7. Emit Real-time Update via WebSockets
    const io = req.app.get('socketio');
    if (io) {
      io.emit('new_complaint_ai_processed', {
         id: savedComplaint._id,
         ticketId: savedComplaint.ticketId,
         category,
         priority,
         location: parsedLocation,
         status: savedComplaint.status,
         authenticityScore: savedComplaint.authenticityScore,
         aiCostEstimate: savedComplaint.aiCostEstimate,
         aiDamageDimensions: savedComplaint.aiDamageDimensions
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
    let complaint;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      complaint = await Complaint.findById(req.params.id);
    } else {
      complaint = await Complaint.findOne({ ticketId: req.params.id });
    }
    
    if (!complaint) return res.status(404).json({ success: false, msg: 'Complaint not found with this tracking ID' });
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
router.put('/:id/status', upload.single('proofImage'), async (req, res) => {
  try {
     const { status, remarks, updatedBy, notes } = req.body;
     const updateData = { status, updatedAt: Date.now() };
     
     if (req.file || notes) {
        updateData.resolutionProof = {};
        if (req.file) updateData.resolutionProof.imageUrl = req.file.path;
        if (notes) updateData.resolutionProof.notes = notes;
     }

     const complaint = await Complaint.findByIdAndUpdate(
       req.params.id, 
       updateData, 
       { new: true }
     );
     
     if(complaint) {
       await new ComplaintLog({ complaintId: complaint._id, status, remarks, updatedBy }).save();
       
       // Civic Rewards Gamification System
       if (status === 'resolved' && complaint.userId) {
          const user = await User.findById(complaint.userId);
          if (user) {
             user.civicPoints = (user.civicPoints || 0) + 10; // Award 10 points for resolved issue
             await user.save();
             console.log(`GAMIFICATION: Awarded 10 Civic Points to user ${user.email} for resolving complaint!`);
          }
       }

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
