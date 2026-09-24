require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    // Attempt DB connection
    await connectDB();

    const server = app.listen(PORT, () => {
        console.log(`
=========================================================
  🌿 SWASTHAI Full-Stack Clinical Server Active 🚀
  =========================================================
  🌐 API Base URL:       http://localhost:${PORT}/api
  📁 Static Uploads:     http://localhost:${PORT}/uploads
  🖥️ Frontend Root:      http://localhost:${PORT}/index.html
  🛡️ Environment:        ${process.env.NODE_ENV || "development"}
=========================================================
        `);
    });

    process.on("unhandledRejection", (err) => {
        console.error("❌ [Unhandled Rejection]:", err.message);
    });
};

startServer();
