const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
console.log("Loaded PORT from .env:", process.env.PORT);
require("./config/db");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path}`);
  if (
    req.method === "POST" &&
    (req.path.includes("/medications") || req.path.includes("/appointments"))
  ) {
    // Log on finish to capture user after auth middleware runs and status code
    res.on("finish", () => {
      console.log(`${req.method} ${req.path} [${res.statusCode}]`, {
        body: req.body,
        user: req.user ? req.user.id : "Unauthenticated",
      });
    });
  }
  next();
});

// Security Middleware
// Temporarily disabled to debug - will re-enable after fixing
// app.use(helmet());

// Rate Limiting - Temporarily disabled to debug
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 1000, // Lenient limit for development
//   standardHeaders: true,
//   legacyHeaders: false,
//   handler: (req, res) => {
//     console.log("Rate limit exceeded for:", req.path);
//     res
//       .status(429)
//       .json({ message: "Too many requests, please try again later." });
//   },
// });
// app.use(limiter);

// Mount routes at root; Vite dev proxy strips the /api prefix
// so frontend /api/* calls become backend /* here.
app.use("/auth", require("./routes/auth"));
app.use(require("./routes/medications"));
app.use(require("./routes/appointments"));
app.use(require("./routes/users"));
app.use(require("./routes/caregiver"));

const PORT = process.env.PORT || 5001;
// On some macOS setups, port 5000 may already be bound on wildcard addresses
// (e.g. AirPlay/AirTunes). Binding explicitly to loopback keeps local dev stable.
const HOST = process.env.HOST || "127.0.0.1";

app.listen(PORT, HOST, () =>
  console.log(`Server running on http://${HOST}:${PORT}`),
);
