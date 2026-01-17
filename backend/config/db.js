const mongoose = require("mongoose");

if (!process.env.MONGODB_URI) {
  console.error("ERROR: MONGODB_URI is not set in .env file");
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    console.error("Make sure MongoDB is running on:", process.env.MONGODB_URI);
    console.warn("Server will continue but database operations will fail until MongoDB is started.");
    // Don't exit - allow server to start and retry connection
    // Retry connection every 10 seconds
    setTimeout(connectDB, 10000);
  }
};

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

// Connect to database
connectDB();

module.exports = mongoose;
