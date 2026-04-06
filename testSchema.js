const mongoose = require('mongoose');
const { Complaint } = require('./backend/models/Schemas');
console.log(Complaint.schema.paths.ticketId);
