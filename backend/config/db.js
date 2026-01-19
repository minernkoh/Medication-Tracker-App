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
    console.warn(
      "Server will continue but database operations will fail until MongoDB is started.",
    );
    // Don't exit - allow server to start and retry connection
    // Retry connection every 10 seconds
    setTimeout(connectDB, 10000);
  }
};

mongoose.connection.once("open", async () => {
  try {
    const User = require("../models/User");
    const indexes = await User.collection.indexes();
    const legacyEmailIndex = indexes.find(
      (idx) =>
        idx.unique === true &&
        idx.key &&
        Object.keys(idx.key).length === 1 &&
        idx.key.email === 1,
    );

    if (legacyEmailIndex) {
      await User.collection.dropIndex(legacyEmailIndex.name);
      console.log("Dropped legacy unique index:", legacyEmailIndex.name);
    }

    await User.collection.createIndex({ email: 1, role: 1 }, { unique: true });
  } catch (err) {
    console.warn("Index maintenance skipped:", err.message);
  }
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

// Connect to database
connectDB();

module.exports = mongoose;
