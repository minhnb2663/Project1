const dns = require("node:dns");
const dnsPromises = require("node:dns/promises");
const mongoose = require("mongoose");

// Fix lỗi querySrv ECONNREFUSED
dns.setServers(["1.1.1.1", "8.8.8.8"]);
dnsPromises.setServers(["1.1.1.1", "8.8.8.8"]);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ Kết nối MongoDB thành công!");
  } catch (error) {
    console.error("❌ Lỗi kết nối MongoDB:", error.message);
    throw error;
  }
};

module.exports = connectDB;