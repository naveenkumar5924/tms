require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('SuperAdmin@123', 10);
    
    let adminExists = await User.findOne({ role: 'SuperAdmin' });
    if (adminExists) {
      console.log('Found existing SuperAdmin. Updating credentials...');
      adminExists.email = 'superadmin@example.com';
      adminExists.username = 'superadmin';
      adminExists.password = hashedPassword;
      await adminExists.save();
      console.log('Credentials updated.');
    } else {
      const adminUser = new User({
        username: 'superadmin',
        email: 'superadmin@example.com',
        phone: '+1234567890',
        password: hashedPassword,
        role: 'SuperAdmin',
      });
      await adminUser.save();
      console.log('Credentials created.');
    }
    
    console.log('Email: superadmin@example.com');
    console.log('Password: SuperAdmin@123');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetAdmin();
