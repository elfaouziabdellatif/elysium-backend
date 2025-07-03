const User = require('../models/user.model');
const Member = require('../models/adherent.model');
const Coach = require('../models/coach.model');

// GET /users/summary
const getUsersSummary = async (req, res) => {
  try {
    // Find all users with role member or coach
    const users = await User.find({ role: { $in: ['member', 'coach'] } });

    // For each user, fetch the profile data manually by ID
    const result = await Promise.all(users.map(async user => {
      let specialty = null, experience = null, subscription = null, subscriptionStart = null;
      if (user.role === 'coach' && user.profile) {
        const coachProfile = await Coach.findById(user.profile);
        if (coachProfile) {
          specialty = coachProfile.specialty || null;
          experience = coachProfile.yearsOfExperience || null;
        }
      }
      if (user.role === 'member' && user.profile) {
        const memberProfile = await Member.findById(user.profile);
        if (memberProfile) {
          subscription = memberProfile.subscription || null;
          subscriptionStart = memberProfile.subscriptionStart ? memberProfile.subscriptionStart.toISOString() : null;
        }
      }
      return {
        id: user._id,
        fullName: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || null,
        subscription,
        subscriptionStart,
        specialty,
        experience
      };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /users/:id
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, subscription, subscriptionStart, specialty, experience } = req.body;

    // Validate required fields
    if (!fullName || !email) {
      return res.status(400).json({ message: 'Full name and email are required' });
    }

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check email uniqueness (excluding current user)
    if (email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(409).json({ message: 'Email already exists' });
      }
    }

    // Update user basic information
    user.name = fullName;
    user.email = email;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    // Update role-specific profile data
    if (user.role === 'member' && user.profile) {
      const memberProfile = await Member.findById(user.profile);
      if (memberProfile) {
        if (subscription !== undefined) memberProfile.subscription = subscription;
        if (subscriptionStart !== undefined) memberProfile.subscriptionStart = new Date(subscriptionStart);
        await memberProfile.save();
      }
    }

    if (user.role === 'coach' && user.profile) {
      const coachProfile = await Coach.findById(user.profile);
      if (coachProfile) {
        if (specialty !== undefined) coachProfile.specialty = specialty;
        if (experience !== undefined) coachProfile.yearsOfExperience = experience;
        await coachProfile.save();
      }
    }

    // Fetch updated user data with profile
    let updatedUserData = {
      id: user._id,
      fullName: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || null,
      subscription: null,
      subscriptionStart: null,
      specialty: null,
      experience: null
    };

    // Get updated profile data
    if (user.role === 'coach' && user.profile) {
      const coachProfile = await Coach.findById(user.profile);
      if (coachProfile) {
        updatedUserData.specialty = coachProfile.specialty || null;
        updatedUserData.experience = coachProfile.yearsOfExperience || null;
      }
    }

    if (user.role === 'member' && user.profile) {
      const memberProfile = await Member.findById(user.profile);
      if (memberProfile) {
        updatedUserData.subscription = memberProfile.subscription || null;
        updatedUserData.subscriptionStart = memberProfile.subscriptionStart ? memberProfile.subscriptionStart.toISOString() : null;
      }
    }

    res.json({ message: 'User updated successfully', user: updatedUserData });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getUsersSummary,
  updateUser
};
