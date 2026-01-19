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
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

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
