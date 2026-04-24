const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db");
const { v4: uuidv4 } = require("uuid");
 
 
// ================= GET =================
router.get("/", async (req, res) => {
  try {
    console.log("🔥 GET HIT");
 
    const pool = await poolPromise;
 
    const result = await pool.request()
      .query("SELECT Id, BarCode, Description FROM dbo.BarCodeMaster");
 
    res.json(result.recordset);
 
  } catch (err) {
    console.error("❌ GET ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
 
 
// ================= INSERT =================
router.post("/", async (req, res) => {
  try {
    const { BarCode, Description } = req.body;
 
    if (!BarCode || !Description) {
      return res.status(400).send("Missing fields");
    }
 
    const pool = await poolPromise;
 
    await pool.request()
      .input("BarCode", sql.VarChar, BarCode)
      .input("Description", sql.VarChar, Description)
      .query(`
        INSERT INTO Barcode (BarCode, Description)
        VALUES (@BarCode, @Description)
      `);
 
    res.send("Inserted");
  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).send(err.message);  // 🔥 important
  }
});
 
// ================= DELETE =================
router.delete("/:barcode", async (req, res) => {
  try {
    console.log("🔥 DELETE HIT:", req.params.barcode);
 
    const pool = await poolPromise;
 
    await pool.request()
      .input("BarCode", sql.VarChar, req.params.barcode)
      .query("DELETE FROM dbo.BarCodeMaster WHERE BarCode=@BarCode");
 
    res.json({ message: "Deleted successfully" });
 
  } catch (err) {
    console.error("❌ DELETE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
 
 
// ================= UPDATE (FINAL FIX) =================
router.put("/:id", async (req, res) => {
  try {
    const { BarCode, Description } = req.body;
    const { id } = req.params;
 
    console.log("🔥 UPDATE HIT:", id);
 
    const pool = await poolPromise;
 
    const result = await pool.request()
      .input("Id", sql.UniqueIdentifier, id) // ✅ FIXED
      .input("BarCode", sql.VarChar, BarCode)
      .input("Description", sql.VarChar, Description)
      .query(`
        UPDATE dbo.BarCodeMaster
        SET
          BarCode = @BarCode,
          Description = @Description
        WHERE Id = @Id
      `);
 
    console.log("Rows affected:", result.rowsAffected[0]);
 
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        error: "❌ No update — ID mismatch"
      });
    }
 
    res.json({ message: "Updated successfully" });
 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
 
module.exports = router;
 