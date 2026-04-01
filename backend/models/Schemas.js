const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 1. Users Schema
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true }, // Hashed
  role: { type: String, enum: ['citizen', 'authority', 'admin'], default: 'citizen' },
  createdAt: { type: Date, default: Date.now }
});

// 2. Complaints Schema
const ComplaintSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['roads', 'water', 'sanitation', 'electricity', 'others'] },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
  status: { type: String, enum: ['submitted', 'accepted', 'in progress', 'resolved'], default: 'submitted' },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  imageUrl: String,
  voiceText: String,
  departmentAssigned: { type: Schema.Types.ObjectId, ref: 'Department' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 3. Departments Schema
const DepartmentSchema = new Schema({
  name: { type: String, required: true }, // 'roads', 'electricity', etc.
  authorityUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

// 4. ComplaintLogs Schema
const ComplaintLogSchema = new Schema({
  complaintId: { type: Schema.Types.ObjectId, ref: 'Complaint' },
  status: String,
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
  remarks: String
});

// 5. Notifications Schema
const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  message: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// 6. DuplicateReports Schema (for AI Verification)
const DuplicateReportSchema = new Schema({
  complaintId: { type: Schema.Types.ObjectId, ref: 'Complaint' },
  similarComplaintId: { type: Schema.Types.ObjectId, ref: 'Complaint' },
  similarityScore: Number
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  Complaint: mongoose.model('Complaint', ComplaintSchema),
  Department: mongoose.model('Department', DepartmentSchema),
  ComplaintLog: mongoose.model('ComplaintLog', ComplaintLogSchema),
  Notification: mongoose.model('Notification', NotificationSchema),
  DuplicateReport: mongoose.model('DuplicateReport', DuplicateReportSchema)
};
