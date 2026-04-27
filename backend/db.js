require("dotenv").config();
const sql = require("mssql");

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 1433,
  database: process.env.DB_DATABASE,

  options: {
    encrypt: true,                 // 🔥 MUST for Railway
    trustServerCertificate: true,
    enableArithAbort: true,
  },

  requestTimeout: 60000,
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log("✅ Connected to MSSQL");
    return pool;
  })
  .catch(err => {
    console.error("❌ DB Connection Error:", err);
  });

module.exports = { sql, poolPromise };