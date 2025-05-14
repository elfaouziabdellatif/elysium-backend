const mongoose = require('mongoose');

const CoachSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    specialty: String,
    yearsOfExperience: Number,
    certifications: String, // You may change to [String] if comma-separated values are parsed
  });
  
  module.exports = mongoose.model('Coach', CoachSchema);
