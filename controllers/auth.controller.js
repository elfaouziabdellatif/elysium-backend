const User = require('../models/user.model');
const Member = require('../models/adherent.model');
const Coach = require('../models/coach.model');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const generateRandomPassword = require('./../utils/genratePassword')

// Admin registers users
exports.registerUser = async (req, res) => {
    const {
      fullName, email, phone, dob, gender, role,
      specialty, experience, certifications,
      emergencyContact, emergencyPhone, medicalInfo, 
      subscription, subscriptionStart
    } = req.body;
  
    
    try {
      // Check if email already exists
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: 'Email already exists' });
  
      // Hash password
      const hashed =  generateRandomPassword(fullName);
      const cryptedPassword = await bcrypt.hash(hashed, 10);
  
      // Create the new user
      const newUser = new User({
        name: fullName,
        email,
        password: cryptedPassword,
        phone,
        dob,
        gender,
        role,
      });
  
      await newUser.save();
      // Create role-specific profile
      let profileModel;
      switch (role) {
        case 'member':
          // Create member profile
          profileModel = await Member.create({
            user: newUser._id,
            emergencyContact,
            emergencyPhone,
            medicalInfo,
            subscription,
            subscriptionStart
          });
          break;
        case 'coach':
          // Create coach profile
          profileModel = await Coach.create({
            user: newUser._id,
            specialty,
            yearsOfExperience: Number(experience),
            certifications
          });
          break;
      }
  
      // Assign profile to the user
      newUser.profile = profileModel._id;
      await newUser.save();
  
      // Respond with the created user
      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          dob: newUser.dob,
          gender: newUser.gender,
          role: newUser.role,
          profile: newUser.profile
        },
        password: hashed // This is the generated password, not the hashed one
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };
  
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: 'password incorrect' });

        const token = generateToken(user);
        res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
