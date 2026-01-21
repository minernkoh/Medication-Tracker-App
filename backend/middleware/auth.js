/**
 * Auth middleware (JWT)
 *
 * Reads `Authorization: Bearer <token>` and populates `req.user` with the
 * decoded payload (ex: `{ id, role }`).
 *
 * Used by almost every API route.
 */

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: "Server configuration error" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = verifyToken;
