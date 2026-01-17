const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
console.log("Loaded PORT from .env:", process.env.PORT);
require("./config/db");

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  if (req.method === "POST" && (req.path.includes("/medications") || req.path.includes("/appointments"))) {
    console.log(`${req.method} ${req.path}`, {
      body: req.body,
      user: req.user || "No user",
    });
  }
  next();
});

// Mount routes at root; Vite dev proxy strips the /api prefix
// so frontend /api/* calls become backend /* here.
app.use("/auth", require("./routes/auth"));
app.use(require("./routes/medications"));
app.use(require("./routes/appointments"));
app.use(require("./routes/users"));
app.use(require("./routes/caregiver"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
