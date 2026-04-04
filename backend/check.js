const mongoose = require('mongoose');
const { User } = require('./models/Schemas');

async function checkDB() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({});
  console.log("Users in DB:", users.map(u => ({ email: u.email, pass: u.password, role: u.role, isVerified: u.isVerified })));
  process.exit(0);
}
checkDB();
