const Seance = require('../models/seance.model');

// POST /seances - Create a new session
const createSeance = async (req, res) => {
  try {
    const { title, date, time, specialty, maxMembers, description, duration, status } = req.body;

    // Validate required fields
    if (!title || !date || !time || !specialty || !maxMembers) {
      return res.status(400).json({ 
        message: 'Title, date, time, specialty, and maxMembers are required' 
      });
    }

    // Validate maxMembers is a positive number
    if (maxMembers < 1) {
      return res.status(400).json({ 
        message: 'maxMembers must be at least 1' 
      });
    }

    // Create new seance with coach ID from authenticated user
    const newSeance = new Seance({
      title,
      date: new Date(date),
      time,
      specialty,
      maxMembers,
      description: description || title, // Use title as description if not provided
      duration: duration || 60, // Default 60 minutes
      status: status || 'active', // Default active
      coach: req.user.id // Save the authenticated user's ID as coach
    });

    await newSeance.save();

    res.status(201).json({
      message: 'Seance created successfully',
      seance: newSeance
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// GET /seances - Get all sessions
const getAllSeances = async (req, res) => {
  try {
    const seances = await Seance.find()
      .populate('coach', 'name email')
      .populate('registeredMembers', 'name email')
      .sort({ date: 1, time: 1 });

    res.json(seances);
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// GET /seances/:id - Get a specific session
const getSeanceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const seance = await Seance.findById(id)
      .populate('coach', 'name email')
      .populate('registeredMembers', 'name email');

    if (!seance) {
      return res.status(404).json({ message: 'Seance not found' });
    }

    res.json(seance);
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// GET /coach/seances - Get seances created by the authenticated coach
const getCoachSeances = async (req, res) => {
  try {
    // Get seances where coach field matches the authenticated user's ID
    const seances = await Seance.find({ coach: req.user.id })
      .populate('coach', 'name email')
      .populate('registeredMembers', 'name email')
      .sort({ date: 1, time: 1 });

    res.json({
     seances
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// GET /member/seances/available - Get available seances for members
const getAvailableSeances = async (req, res) => {
  try {
    // Get seances that are active and have available spots
    const seances = await Seance.find({ 
      status: 'active',
      date: { $gte: new Date() } // Only future or today's seances
    })
      .populate('coach', 'name email')
      .populate('registeredMembers', 'name email')
      .sort({ date: 1, time: 1 });

    // Filter seances that have available spots and format the response
    const availableSeances = seances.map(seance => {
      const registeredCount = seance.registeredMembers.length;
      const availableSpots = seance.maxMembers - registeredCount;
      const isUserRegistered = seance.registeredMembers.some(
        member => member._id.toString() === req.user.id
      );

      return {
        ...seance.toObject(),
        registeredCount,
        availableSpots,
        isUserRegistered,
        canReserve: availableSpots > 0 && !isUserRegistered
      };
    });

    res.json({
      seances: availableSeances
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// POST /member/seances/:seanceId/reserve - Reserve a seance
const reserveSeance = async (req, res) => {
  try {
    const { seanceId ,userId} = req.params;

    // Find the seance
    const seance = await Seance.findById(seanceId);
    if (!seance) {
      return res.status(404).json({ message: 'Seance not found' });
    }

    // Check if seance is active
    if (seance.status !== 'active') {
      return res.status(400).json({ message: 'Seance is not available for reservation' });
    }

    // Check if seance date is in the future or today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (seance.date < today) {
      return res.status(400).json({ message: 'Cannot reserve past seances' });
    }

    // Check if member is already registered
    if (seance.registeredMembers.includes(userId)) {
      return res.status(400).json({ message: 'You are already registered for this seance' });
    }

    // Check if seance has available spots
    if (seance.registeredMembers.length >= seance.maxMembers) {
      return res.status(400).json({ message: 'Seance is fully booked' });
    }

    // Add member to registered members
    seance.registeredMembers.push(userId);
    await seance.save();

    // Populate and return updated seance
    const updatedSeance = await Seance.findById(seanceId)
      .populate('coach', 'name email')
      .populate('registeredMembers', 'name email');

    res.status(200).json({
      message: 'Successfully reserved seance',
      seance: {
        ...updatedSeance.toObject(),
        registeredCount: updatedSeance.registeredMembers.length,
        availableSpots: updatedSeance.maxMembers - updatedSeance.registeredMembers.length
      }
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// GET /member/seances/:memberId - Get seances reserved by a specific member
const getMemberReservedSeances = async (req, res) => {
  try {
    const { memberId } = req.params;
    console.log(`Fetching reserved seances for member ID: ${memberId}`);
    // Find all seances where the member is in registeredMembers array
    const seances = await Seance.find({ 
      registeredMembers: { $in: [memberId] }
    })
      .populate('coach', 'name email')
      .populate('registeredMembers', 'name email')
      .sort({ date: 1, time: 1 });

      console.log(`Found ${seances.length} seances for member ${memberId}`);
    // Format the response with additional information
    const reservedSeances = seances.map(seance => {
      const registeredCount = seance.registeredMembers.length;
      const availableSpots = seance.maxMembers - registeredCount;
      
      return {
        ...seance.toObject(),
        registeredCount,
        availableSpots,
        reservationStatus: seance.status === 'active' ? 'confirmed' : seance.status
      };
    });

    res.json({
      message: 'Member reserved seances retrieved successfully',
      seances: reservedSeances,
      totalReservations: reservedSeances.length
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

module.exports = {
  createSeance,
  getAllSeances,
  getSeanceById,
  getCoachSeances,
  getAvailableSeances,
  reserveSeance,
  getMemberReservedSeances
};
