// create-superAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User"); // ✅ FIXED

mongoose.connect(process.env.MONGO_URL)
  .then(async () => {
    console.log("✅ MongoDB connected");

    const email = "superadmin@example.com";

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("⚠️ Superadmin already exists");
      return process.exit();
    }

    const hashedPassword = await bcrypt.hash("supersecret", 10);

    const superadmin = new User({
      name: "Super Admin",
      email,
      password: hashedPassword,
      role: "superadmin",
    });

    await superadmin.save();
    console.log("✅ Superadmin created:", superadmin);
    process.exit();
  })
  .catch((err) => {
    console.error("❌ Error connecting to DB", err);
    process.exit(1);
  });