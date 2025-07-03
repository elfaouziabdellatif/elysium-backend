const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/elysium-gym', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import your models
const User = require('./../models/user.model');
const Member = require('./../models/adherent.model');
const Coach = require('./../models/coach.model');

// Utility
const hashPassword = async (plain) => await bcrypt.hash(plain, 10);

const roles = ['member', 'coach'];

const createFakeUser = async () => {
  const role = faker.helpers.arrayElement(roles);

  const hashedPassword = await hashPassword('password123');

  const user = new User({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number('+2126########'),
    dob: faker.date.birthdate({ min: 1980, max: 2005, mode: 'year' }),
    gender: faker.helpers.arrayElement(['male', 'female']),
    password: hashedPassword,
    role: role,
    profilePicture: faker.image.avatar(),
  });

  await user.save();

  // Create corresponding profile
  if (role === 'coach') {
    const coach = new Coach({
      user: user._id,
      specialty: faker.person.jobType(),
      yearsOfExperience: faker.number.int({ min: 1, max: 15 }),
      certifications: faker.lorem.words(3),
    });
    await coach.save();

    user.profile = coach._id;
  } else if (role === 'member') {
    const member = new Member({
      user: user._id,
      emergencyContact: faker.person.fullName(),
      emergencyPhone: faker.phone.number('+2126########'),
      medicalInfo: faker.lorem.sentence(),
      subscription: faker.helpers.arrayElement(['monthly', 'yearly']),
      subscriptionStart: faker.date.past(),
    });
    await member.save();

    user.profile = member._id;
  }

  await user.save();
};

const seed = async () => {
  try {
    await User.deleteMany({});
    await Member.deleteMany({});
    await Coach.deleteMany({});

    const promises = [];
    for (let i = 0; i < 20; i++) {
      promises.push(createFakeUser());
    }

    await Promise.all(promises);
    console.log('✅ Seeded 20 fake users successfully');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

seed();
