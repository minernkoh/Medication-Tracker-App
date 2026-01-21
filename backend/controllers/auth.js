/**
 * Auth controller
 *
 * Implements:
 * - `signup`: create a user account (patient or caregiver)
 * - `signin`: verify credentials and return a JWT + user profile
 *
 * Key functions:
 * - `signup(req,res)`
 * - `signin(req,res)`
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { validationResult } = require("express-validator");

const signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, role } = req.body;
    if (!email || !role) {
      return res.status(400).json({ message: "Email and role are required" });
    }

    const existing = await User.findOne({ email, role });
    if (existing) {
      return res.status(400).json({ message: "Account already exists" });
    }

    const { name, password } = req.body;
    const user = await User.create({ name, email, password, role });
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json(userObj);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Account already exists" });
    }
    res.status(400).json({ message: error.message });
  }
};

const signin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    if (!req.body || !req.body.email || !req.body.password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const { email, password, role } = req.body;
    let user = null;

    if (role) {
      user = await User.findOne({ email, role });
    } else {
      const matches = await User.find({ email }).limit(2);
      if (matches.length > 1) {
        return res.status(400).json({
          message: "Multiple accounts found. Please select an account type.",
          availableRoles: matches.map((m) => m.role),
        });
      }
      user = matches[0] || null;
    }

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server configuration error" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
    );

    // Return a populated user profile so the UI can show caregiver names immediately
    // (ex: "Caregiver: Alice") without waiting for a separate `/users/me` refresh.
    const populated = await User.findById(user._id)
      .select("-password")
      .populate("caregivers", "name email role")
      .populate("caregiver", "name email role");

    res.json({ token, user: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { signup, signin };
