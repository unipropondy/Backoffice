const express = require("express");
const router = express.Router();
const sql = require("mssql");
const config = require("../db"); // your DB config

// ✅ GET
router.get("/", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query("SELECT * FROM server");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ✅ INSERT
router.post("/", async (req, res) => {
  try {
    const { SER_NAME, Activeflag } = req.body;

    const pool = await sql.connect(config);
    await pool.request()
      .input("SER_NAME", sql.VarChar, SER_NAME)
      .input("CreatedBy", sql.UniqueIdentifier, null)
      .input("Activeflag", sql.Bit, Activeflag)
      .query(`
        INSERT INTO server (SER_NAME, CreatedBy, CreatedDate, Activeflag)
        VALUES (@SER_NAME, @CreatedBy, GETDATE(), @Activeflag)
      `);

    res.send("Inserted Successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ✅ UPDATE
router.put("/:id", async (req, res) => {
  try {
    const { SER_NAME, Activeflag } = req.body;
    const { id } = req.params;

    const pool = await sql.connect(config);
    await pool.request()
      .input("SER_ID", sql.Int, id)
      .input("SER_NAME", sql.VarChar, SER_NAME)
      .input("ModifiedBy", sql.UniqueIdentifier, null)
      .input("Activeflag", sql.Bit, Activeflag)
      .query(`
        UPDATE server
        SET SER_NAME=@SER_NAME,
            ModifiedBy=@ModifiedBy,
            ModifiedDate=GETDATE(),
            Activeflag=@Activeflag
        WHERE SER_ID=@SER_ID
      `);

    res.send("Updated Successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ✅ DELETE
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await sql.connect(config);
    await pool.request()
      .input("SER_ID", sql.Int, id)
      .query("DELETE FROM server WHERE SER_ID=@SER_ID");

    res.send("Deleted Successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;