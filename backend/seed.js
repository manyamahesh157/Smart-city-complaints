const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Department, Complaint } = require('./models/Schemas');

// To run this: node seed.js
const DB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smartcity';

async function seedDatabase() {
  try {
    await mongoose.connect(DB_URI, {});
    console.log('Connected to Database for seeding...');

    // Clear existing
    await User.deleteMany({});
    await Department.deleteMany({});
    await Complaint.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 1. Create Admins & Authority Users
    const adminUser = new User({
       name: 'Global Supervisor Admin',
       email: 'admin@smartcity.gov',
       password: hashedPassword,
       role: 'admin'
    });
    await adminUser.save();

    const roadsAuthUser = new User({
       name: 'Director of Roads & Highways',
       email: 'roads@smartcity.gov',
       password: hashedPassword,
       role: 'authority',
       department: 'Roads'
    });
    await roadsAuthUser.save();

    const waterAuthUser = new User({
      name: 'Director of Sanitation & Water',
      email: 'water@smartcity.gov',
      password: hashedPassword,
      role: 'authority',
      department: 'Water'
   });
   await waterAuthUser.save();

    const electAuthUser = new User({
      name: 'Director of Electricity',
      email: 'electricity@smartcity.gov',
      password: hashedPassword,
      role: 'authority',
      department: 'Electricity'
   });
   await electAuthUser.save();

    // 2. Add Test Complaints
    const complaint1 = new Complaint({
      title: 'Pothole on Main St',
      description: 'Huge pothole damaging cars.',
      category: 'roads',
      department: 'Roads',
      priority: 'high',
      status: 'submitted'
    });
    const complaint2 = new Complaint({
      title: 'Water pipe broke',
      description: 'Leakage near the park.',
      category: 'water',
      department: 'Water',
      priority: 'medium',
      status: 'submitted'
    });
    await Promise.all([complaint1.save(), complaint2.save()]);

    console.log('Seeding Completed Successfully!');
    console.log('Created admin@smartcity.gov, roads@smartcity.gov, water@smartcity.gov, electricity@smartcity.gov with password "password123"');
    
    // allow server to continue
  } catch(err) {
    console.error('Seeding Error:', err);
  }
}

module.exports = seedDatabase;
