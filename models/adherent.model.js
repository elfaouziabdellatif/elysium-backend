const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  emergencyContact: String,
  emergencyPhone: String,
  medicalInfo: String,
  subscription: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
  subscriptionStart: { type: Date },
});

module.exports = mongoose.model('Member', AdherentSchema);
