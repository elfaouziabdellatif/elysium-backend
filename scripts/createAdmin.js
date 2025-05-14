const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await User.findOne({ email: 'admin@elysium.com' });
    if (existing) {
      console.log('⚠️ Admin already exists');
      return process.exit();
    }

    const hashedPassword = await bcrypt.hash('admin123', 10); // Change password if needed

    const admin = new User({
      name: 'Admin',
      email: 'admin@elysium.com',
      password: hashedPassword,
      role: 'admin',
    });

    await admin.save();
    console.log('✅ Admin account created');
    process.exit();
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
    process.exit(1);
  }
};

createAdmin();
