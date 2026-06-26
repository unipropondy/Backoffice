const express = require("express");
const router = express.Router();
const { poolPromise, sql } = require("../db");

// ✅ LOGIN API
router.post("/login", async (req, res) => {
  try {
    const username = req.body.username?.trim();
   const password = req.body.password?.trim();

     const encodedPassword = Buffer.from(password).toString("base64");

    const pool = await poolPromise;

    const result = await pool.request()
      .input("username", sql.VarChar, username)
      .input("password", sql.VarChar, encodedPassword)
      .query(`
        SELECT * FROM USERMASTER
        WHERE UserName = @username 
        AND UserPassword = @password
        AND IsDisabled = 0
      `);

    if (result.recordset.length > 0) {

  const user = result.recordset[0];

  const today = new Date();
  const fromDate = new Date(user.FromDate);
  const toDate = new Date(user.ToDate);

  if (today < fromDate || today > toDate) {
    return res.status(403).json({
      success: false,
      message: "User access expired"
    });
  }

  res.json({
    success: true,
    user
  });

} else {

  res.status(401).json({
    success: false,
    message: "Invalid username or password"
  });

}

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
});

module.exports = router;