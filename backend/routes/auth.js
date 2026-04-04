const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models/Schemas');

// ENV placeholder
const JWT_SECRET = process.env.JWT_SECRET || 'smartcity_super_secure_key';

/**
 * @route POST /api/auth/register
 * @desc Registers a new Citizen/User
 * @access Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    let user = await User.findOne({ email });

    if(user) {
      return res.status(400).json({ success: false, msg: 'User already exists' });
    }

    // Hash password 
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'citizen'
    });

    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    
    jwt.sign(payload, JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
      if (err) throw err;
      res.status(201).json({ success: true, token });
    });

  } catch (err) {
    res.status(500).send('Server Error');
  }
});

/**
 * @route POST /api/auth/login
 * @desc Authenticate User and generate JWT
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
     const { email, password } = req.body;
     let user = await User.findOne({ email });

     if (!user) return res.status(400).json({ success: false, msg: 'Invalid Credentials' });

     const isMatch = await bcrypt.compare(password, user.password);

     if (!isMatch) return res.status(400).json({ success: false, msg: 'Invalid Credentials' });

     const payload = { user: { id: user.id, role: user.role } };
    
     jwt.sign(payload, JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
       if (err) throw err;
       res.status(200).json({ success: true, token });
     });
     
  } catch (err) {
     res.status(500).send('Server Error');
  }
});

/**
 * Example Middleware definition for protecting routes
 */
const protect = (req, res, next) => {
  const token = req.header('x-auth-token');
  if(!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch(err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}

module.exports = { router, protect };
