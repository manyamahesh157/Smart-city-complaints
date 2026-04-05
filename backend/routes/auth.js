const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs'); // Assuming dependency installed
const { User, LoginLog } = require('../models/Schemas');
const rateLimit = require('express-rate-limit');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || 'smartcity_super_secure_key';

// Reusable Transporter for Nodemailer (Ethereal test accounts for prototyping)
let transporter = null;
async function initNodemailer() {
  try {
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user, 
        pass: testAccount.pass, 
      },
    });
    console.log("Nodemailer Ethereal Transport Initialized");
  } catch (err) {
    console.error("Failed to initialize Nodemailer:", err);
  }
}
initNodemailer();

// Rate limiting middleware to prevent brute force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: { success: false, msg: 'Too many login attempts from this IP, please try again after 15 minutes' },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Validation Regex for Password (8-12 length, upper, lower, number, symbol)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;

// Middleware to Log login attempts for Audit
const logAttempt = async (email, ip, userAgent, status, reason = null) => {
   try {
      const user = await User.findOne({ email });
      const log = new LoginLog({
        emailAttempted: email,
        userId: user ? user._id : null,
        ipAddress: ip,
        userAgent: userAgent,
        status: status,
        failureReason: reason
      });
      await log.save();
   } catch(e) {
      console.error('Logging Error', e);
   }
}

/**
 * @route POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, authorityLevel } = req.body;
    let user = await User.findOne({ email });

    if(user) {
      return res.status(400).json({ success: false, msg: 'User already exists' });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({ success: false, msg: 'Password must be 8-12 characters, include upper, lower, number, and symbol.' });
    }

    // Default approval process depending on role
    let isVerified = true;
    if (role === 'authority' || role === 'admin') {
       isVerified = false; // System requires super admin approval
    }

    user = new User({
      name,
      email,
      phone,
      password: password, // Should be hashed natively with bcrypt beforehand
      role: role || 'citizen',
      authorityLevel: authorityLevel,
      isVerified
    });

    await user.save();

    res.status(201).json({ success: true, msg: 'Registration successful.' });

  } catch (err) {
    res.status(500).send('Server Error');
  }
});

/**
 * @route POST /api/auth/login/step1
 */
router.post('/login/step1', loginLimiter, async (req, res) => {
  try {
     const { email, password } = req.body;
     const userAgent = req.get('User-Agent');
     const ip = req.ip;

     let user = await User.findOne({ email });

     if (!user) {
         await logAttempt(email, ip, userAgent, 'failed', 'Invalid Email');
         return res.status(400).json({ success: false, msg: 'Invalid Credentials' });
     }

     const isMatch = (password === user.password); // Compare directly prototype (bcrypt in prod)

     if (!isMatch) {
         await logAttempt(email, ip, userAgent, 'failed', 'Invalid Password');
         return res.status(400).json({ success: false, msg: 'Invalid Credentials' });
     }

     if ((user.role === 'authority' || user.role === 'admin') && !user.isVerified) {
         await logAttempt(email, ip, userAgent, 'failed', 'Account Unverified');
         return res.status(403).json({ success: false, msg: 'Account under verification by Government SuperAdmin. Please wait.' });
     }

     // Generate a 6-digit OTP
     const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
     
     // Bind to User
     user.otpHash = otp; 
     user.otpExpiry = new Date(Date.now() + 10 * 60000); // 10 mins expiry
     await user.save();

     // Dispatch OTP Email
     if (transporter) {
       let info = await transporter.sendMail({
         from: '"Smart City Portal" <no-reply@smartcity.gov>', 
         to: email, // Respective email id
         subject: "Your Smart City Authentication OTP",
         text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
         html: `<h3>Authority Login Verification</h3><p><b>Your OTP is ${otp}</b>. It will expire in exactly 10 minutes. Do not share this.</p>`,
       });
       console.log("OTP Email Sent! Preview URL: %s", nodemailer.getTestMessageUrl(info));
       console.log(`\n========================================`);
       console.log(`>>> PROTOTYPE BYPASS: YOUR OTP IS: ${otp} <<<`);
       console.log(`========================================\n`);
     } else {
       console.log(`[SIMULATED EMAIL FAILURE] To: ${email} -> OTP: ${otp}`);
     }

     res.status(200).json({ success: true, msg: 'OTP sent to your email id.', prototypeOtp: otp });
     
  } catch (err) {
     res.status(500).send('Server Error');
  }
});

/**
 * @route POST /api/auth/login/step2
 */
router.post('/login/step2', loginLimiter, async (req, res) => {
    try {
        const { email, otp } = req.body;
        const userAgent = req.get('User-Agent');
        const ip = req.ip;

        let user = await User.findOne({ email });
        
        if (!user || user.otpHash !== otp || user.otpExpiry < new Date()) {
            await logAttempt(email, ip, userAgent, 'failed', 'Invalid or Expired OTP');
            return res.status(400).json({ success: false, msg: 'Invalid or Expired OTP code.' });
        }

        // Successfully Verified: Nullify the OTP variables to prevent reuse
        user.otpHash = null;
        user.otpExpiry = null;
        await user.save();

        // Register Successful Audit Trail
        await logAttempt(email, ip, userAgent, 'success');

        // Short lived token enforcing Session Management Timeout mapping to Role criteria
        const payload = { user: { id: user.id, role: user.role, authorityLevel: user.authorityLevel } };
        
        jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' }, (err, token) => { 
          if (err) throw err;
          res.status(200).json({ success: true, token, role: user.role });
        });

    } catch(err) {
        res.status(500).send('Server Error');
    }
});


/**
 * @route POST /api/auth/login (Fallback for pure Citizen older routes / non-OTP cases currently, deprecate later)
 */
 router.post('/login', async (req, res) => {
  // redirecting behavior
  const { email, password } = req.body;
  req.body.email = email;
  req.body.password = password;
  return res.redirect(308, '/api/auth/login/step1');
});


// Core Middleware definition for protecting routes against session expirations
const protect = (req, res, next) => {
  const token = req.header('x-auth-token');
  if(!token) return res.status(401).json({ msg: 'No active session token, authorization denied' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch(err) {
    res.status(401).json({ msg: 'Session token is invalid or has expired due to inactivity rule' });
  }
}

// Check if authority
const authorizeRoles = (...roles) => {
   return (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
         return res.status(403).json({ msg: `Access Blocked. Only ${roles.join(', ')} roles allowed.` });
      }
      next();
   }
};

/**
 * @route GET /api/auth/leaderboard
 * @desc Get top citizens by civic points
 * @access Public
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const topCitizens = await User.find({ role: 'citizen' })
                                  .sort({ civicPoints: -1 })
                                  .limit(10)
                                  .select('name civicPoints createdAt');
    res.json({ success: true, count: topCitizens.length, data: topCitizens });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Server error fetching leaderboard' });
  }
});

module.exports = { router, protect, authorizeRoles };
