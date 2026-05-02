const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db");

// 🔍 GET
router.get("/", async (req, res) => {
  try {
    console.log("GET HIT");

    const pool = await poolPromise;
    const result = await pool.request()
      .query("SELECT * FROM ServiceMaster");

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

// ➕ POST
router.post("/", async (req, res) => {
  try {
    console.log("POST HIT", req.body);

    const { SER_NAME, Activeflag } = req.body;

    const pool = await poolPromise;
    await pool.request()
      .input("name", sql.VarChar, SER_NAME)
      .input("active", sql.Bit, Activeflag)
      .query(`
        INSERT INTO ServiceMaster (SER_NAME, Activeflag, CreatedDate)
        VALUES (@name, @active, GETDATE())
      `);

    res.send("Inserted");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

// ✏️ PUT
router.put("/:id", async (req, res) => {
  try {
    console.log("PUT HIT", req.params.id);

    const { id } = req.params;
    const { SER_NAME, Activeflag } = req.body;

    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, id)
      .input("name", sql.VarChar, SER_NAME)
      .input("active", sql.Bit, Activeflag)
      .query(`
        UPDATE ServiceMaster
        SET SER_NAME = @name,
            Activeflag = @active,
            ModifiedDate = GETDATE()
        WHERE SER_ID = @id
      `);

    res.send("Updated");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

// ❌ DELETE
router.delete("/:id", async (req, res) => {
  try {
    console.log("DELETE HIT", req.params.id);

    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM ServiceMaster WHERE SER_ID = @id");

    res.send("Deleted");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

module.exports = router;