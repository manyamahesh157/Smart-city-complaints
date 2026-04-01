const mongoose = require('mongoose');
const { User, Department } = require('./models/Schemas');

// To run this: node seed.js
const DB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smartcity';

async function seedDatabase() {
  try {
    await mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to Database for seeding...');

    // Clear existing
    await User.deleteMany({});
    await Department.deleteMany({});

    // 1. Create Admins & Authority Users
    const adminUser = new User({
       name: 'Global Supervisor Admin',
       email: 'admin@smartcity.gov',
       password: 'password123', // In prod: bcrypt hash
       role: 'admin'
    });
    await adminUser.save();

    const roadsAuthUser = new User({
       name: 'Director of Roads & Highways',
       email: 'roads@smartcity.gov',
       password: 'password123',
       role: 'authority'
    });
    await roadsAuthUser.save();

    const waterAuthUser = new User({
      name: 'Director of Sanitation & Water',
      email: 'water@smartcity.gov',
      password: 'password123',
      role: 'authority'
   });
   await waterAuthUser.save();

    // 2. Create Departments mapped to Authorities
    const roadsDept = new Department({
       name: 'roads',
       authorityUsers: [roadsAuthUser._id]
    });
    
    const waterDept = new Department({
       name: 'water',
       authorityUsers: [waterAuthUser._id]
    });

    const electricityDept = new Department({ name: 'electricity', authorityUsers: [] });
    const sanitationDept = new Department({ name: 'sanitation', authorityUsers: [] });
    const othersDept = new Department({ name: 'others', authorityUsers: [] });

    await Promise.all([roadsDept.save(), waterDept.save(), electricityDept.save(), sanitationDept.save(), othersDept.save()]);

    console.log('Seeding Completed Successfully!');
    console.log('Created predefined Departments and admin@smartcity.gov, roads@smartcity.gov');
    
    process.exit(0);
  } catch(err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
}

seedDatabase();
