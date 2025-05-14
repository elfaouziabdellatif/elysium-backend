const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    dob: { type: Date },
    gender: { type: String, enum: ['male', 'female'] },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['member', 'coach', 'admin'],
      default: 'member',
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'role',
    },
    profilePicture: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model('User', UserSchema);
  
