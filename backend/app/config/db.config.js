// backend/app/config/db.config.js
module.exports = {
  // prefer explicit MONGO_URL, then other common names, then a localhost fallback
  url: process.env.MONGO_URL || process.env.MONGODB_URI || process.env.DB_URL || 'mongodb://localhost:27017/appdb'
};
