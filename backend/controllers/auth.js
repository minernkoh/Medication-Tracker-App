const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signup = async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
};

const signin = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await user.comparePassword(req.body.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET
  );

  res.json({ token, user });
};

module.exports = { signup, signin };
