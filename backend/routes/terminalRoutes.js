const express = require("express");
const router = express.Router();
 
const { sql, poolPromise } = require("../db");
 
// =============================
// 🔥 GET ALL
// =============================
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM TerminalMaster");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});
 
 
// =============================
// 🔥 GET BY ID
// =============================
router.get("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM TerminalMaster WHERE TerminalId = @id");
 
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
 
 
// =============================
// 🔥 INSERT / UPDATE
// =============================
router.post("/", async (req, res) => {
  try {
    const pool = await poolPromise;
 
    const {
      terminalId,
      terminalCode,
      terminalName,
      locationCode,
      computerName,
      tillAmount
    } = req.body;
 
    // 🔥 CHECK EXISTS
    const check = await pool.request()
      .input("id", sql.Int, terminalId || 0)
      .query("SELECT * FROM TerminalMaster WHERE TerminalId = @id");
 
    if (check.recordset.length > 0) {
      // UPDATE
      await pool.request()
        .input("id", sql.Int, terminalId)
        .input("code", sql.VarChar, terminalCode)
        .input("name", sql.VarChar, terminalName)
        .input("loc", sql.VarChar, locationCode)
        .input("comp", sql.VarChar, computerName)
        .input("amt", sql.Decimal, tillAmount)
        .query(`
          UPDATE TerminalMaster SET
            TerminalCode = @code,
            TerminalName = @name,
            LocationCode = @loc,
            ComputerName = @comp,
            TillAmount = @amt
          WHERE TerminalId = @id
        `);
 
      res.send("Updated ✅");
 
    } else {
      // INSERT
      await pool.request()
        .input("code", sql.VarChar, terminalCode)
        .input("name", sql.VarChar, terminalName)
        .input("loc", sql.VarChar, locationCode)
        .input("comp", sql.VarChar, computerName)
        .input("amt", sql.Decimal, tillAmount)
        .query(`
          INSERT INTO TerminalMaster
          (TerminalCode, TerminalName, LocationCode, ComputerName, TillAmount)
          VALUES (@code, @name, @loc, @comp, @amt)
        `);
 
      res.send("Inserted ✅");
    }
 
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});
 
 
// =============================
// 🔥 DELETE
// =============================
router.delete("/", async (req, res) => {
  try {
    const pool = await poolPromise;
 
    const { terminalId } = req.body;
 
    await pool.request()
      .input("id", sql.Int, terminalId)
      .query("DELETE FROM TerminalMaster WHERE TerminalId = @id");
 
    res.send("Deleted ✅");
 
  } catch (err) {
    res.status(500).send(err.message);
  }
});
 
 
module.exports = router;
 