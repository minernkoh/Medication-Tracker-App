const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
require("./config/db");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false, 
  }),
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000, 
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use("/auth", require("./routes/auth"));
app.use(require("./routes/medications"));
app.use(require("./routes/appointments"));
app.use(require("./routes/users"));
app.use(require("./routes/caregiver"));

const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || "127.0.0.1";

app.listen(PORT, HOST, () =>
  console.log(`Server running on http://${HOST}:${PORT}`),
);
