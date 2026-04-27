const express = require("express");
const router = express.Router();
const sql = require("mssql");
const { poolPromise } = require("../db"); // 🔥 FIX

router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT TOP 10 
        CustomerId,
        CustomerCode,
        Name,
        ContactPerson,
        EmailId1,
        Address1_City,
        Address1_Telephone1
      FROM dbo.CustomerMaster
      ORDER BY Name
    `);

    res.json(result.recordset);

  } catch (err) {
    console.log("BACKEND ERROR ❌", err);
    res.status(500).json({
      error: err.message,
      stack: err.stack
    });
  }
});

module.exports = router;