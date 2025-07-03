const mongoose = require('mongoose');

const SeanceSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  time: { 
    type: String, 
    required: true 
  },
  specialty: { 
    type: String, 
    required: true 
  },
  maxMembers: { 
    type: Number, 
    required: true,
    min: 1 
  },
  description: { 
    type: String, 
    required: true 
  },
  duration: { 
    type: Number, 
    default: 60,
    min: 15 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'completed', 'cancelled'],
    default: 'active' 
  },
  coach: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  registeredMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Seance', SeanceSchema);
