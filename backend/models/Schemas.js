const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 1. Users Schema
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true }, // Hashed
  role: { type: String, enum: ['citizen', 'authority', 'admin'], default: 'citizen' },
  authorityLevel: { type: String, enum: ['Admin', 'Officer', 'Viewer'] },
  isVerified: { type: Boolean, default: false }, // Useful for Authorities to be approved
  otpHash: { type: String },
  otpExpiry: { type: Date },
  civicPoints: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// 2. Complaints Schema
const ComplaintSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['roads', 'water', 'sanitation', 'electricity', 'others', 'Roads & Infrastructure', 'Water Supply', 'Waste Management', 'Public Safety', 'Electricity'] },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
  ticketId: { type: String, unique: true },
  authenticityScore: { type: Number },
  status: { type: String, enum: ['submitted', 'accepted', 'in progress', 'resolved', 'closed', 'rejected'], default: 'submitted' },
  resolutionProof: {
    imageUrl: String,
    notes: String
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  imageUrl: String,
  voiceText: String,
  aiCostEstimate: String,
  aiDamageDimensions: String,
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

// 7. LoginLogs Schema
const LoginLogSchema = new Schema({
  emailAttempted: String, // Useful for failed logins where user might not exist
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  ipAddress: String,
  userAgent: String,
  status: { type: String, enum: ['success', 'failed'] },
  failureReason: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  Complaint: mongoose.model('Complaint', ComplaintSchema),
  Department: mongoose.model('Department', DepartmentSchema),
  ComplaintLog: mongoose.model('ComplaintLog', ComplaintLogSchema),
  Notification: mongoose.model('Notification', NotificationSchema),
  DuplicateReport: mongoose.model('DuplicateReport', DuplicateReportSchema),
  LoginLog: mongoose.model('LoginLog', LoginLogSchema)
};
