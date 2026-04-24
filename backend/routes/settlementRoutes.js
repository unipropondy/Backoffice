const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db");

// ✅ PAYMENT
router.get("/payment/:terminal/:userId", async (req, res) => {
  const { terminal, userId } = req.params;
  const pool = await poolPromise;

  const result = await pool.request()
    .input("terminal", sql.VarChar, terminal)
    .input("userId", sql.VarChar, userId)
    .query(`
      SELECT PaymodeName, SUM(SysAmount) AS SysAmount
      FROM PaymentDetail
      WHERE UserId = @userId 
      AND TerminalCode = @terminal
      AND isSettlement = 0
      GROUP BY PaymodeName
    `);

  res.json(result.recordset);
});

// ✅ TOTALS (NEW ADD)
router.get("/totals/:terminal", async (req, res) => {
  const { terminal } = req.params;
  const pool = await poolPromise;

  const result = await pool.request()
    .input("terminal", sql.VarChar, terminal)
    .query(`
      SELECT 
        ISNULL(SUM(TotalLineItemAmount),0) AS SubTotal,
        ISNULL(SUM(TotalDiscountAmount),0) AS DiscountAmount,
        ISNULL(SUM(ServiceCharge),0) AS ServiceCharge,
        ISNULL(SUM(TotalTax),0) AS TotalTax,
        ISNULL(SUM(RoundedBy),0) AS RoundedBy,
        ISNULL(SUM(Tips),0) AS Tips
      FROM RestaurantInvoice
      WHERE TerminalCode = @terminal
    `);

  res.json(result.recordset[0]);
});

// ✅ TRANSACTION (NEW ADD)
router.get("/payment/:terminal/:userId", async (req, res) => {
  const { terminal, userId } = req.params;
  const pool = await poolPromise;

  const result = await pool.request()
    .input("terminal", sql.VarChar, terminal)
    .input("userId", sql.VarChar, userId)
    .query(`
      SELECT  SUM(Amount) AS Amount
      FROM PaymentDetail
      WHERE TerminalCode = @terminal
   `);

  res.json(result.recordset);
});

module.exports = router;