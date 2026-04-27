const express = require("express");
const router = express.Router();
const sql = require("mssql");
const poolPromise = require("../db");

// ✅ GET LIST
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
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET SINGLE
router.get("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("CustomerId", sql.UniqueIdentifier, req.params.id)
      .query(`
        SELECT 
          CustomerId,
          CustomerCode,
          Name,
          ContactPerson,
          EmailId1,
          Address1_City,
          Address1_Telephone1
        FROM dbo.CustomerMaster
        WHERE CustomerId = @CustomerId
      `);

    res.json(result.recordset[0] || {});

  } catch (err) {
    console.log("BACKEND ERROR ❌", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;