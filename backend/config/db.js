const mongoose = require("mongoose");

if (!process.env.MONGODB_URI) {
  console.error("ERROR: MONGODB_URI is not set in .env file");
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
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
    }

    await User.collection.createIndex({ email: 1, role: 1 }, { unique: true });
  } catch (err) {}
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {});

connectDB();

module.exports = mongoose;
