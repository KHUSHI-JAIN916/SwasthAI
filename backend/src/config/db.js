const mongoose = require("mongoose");

// Prevent Mongoose from buffering queries indefinitely when offline
mongoose.set("bufferCommands", false);

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        return;
    }

    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/swasthai";

    try {
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            autoIndex: true
        });
        isConnected = true;
        console.log(`✅ [MongoDB Connected] Host: ${conn.connection.host}, DB: ${conn.connection.name}`);
    } catch (error) {
        console.warn(`⚠️ [MongoDB Connection Warning] Could not connect to ${uri}: ${error.message}`);
        console.warn("ℹ️ The backend will continue to operate with memory cache/fallback where necessary.");
    }
};

mongoose.connection.on("disconnected", () => {
    isConnected = false;
    console.warn("⚠️ [MongoDB Disconnected] Lost connection to MongoDB.");
});

mongoose.connection.on("error", (err) => {
    console.error("❌ [MongoDB Error]:", err.message);
});

module.exports = { connectDB, getIsConnected: () => isConnected };
