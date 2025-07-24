// create-admin.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User'); // Adjust path if needed

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('🟢 Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: 'admin@college.com' });
    if (existingAdmin) {
      console.log('⚠️ Admin already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10); // 👈 You can change the password

    const adminUser = new User({
      name: 'Super Admin',
      email: 'admin@college.com',
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
  } catch (err) {
    console.error('❌ Error creating admin:', err);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();