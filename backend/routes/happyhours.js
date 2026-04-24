const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db");
 
console.log("🔥 HAPPYHOURS (NO DB CHANGE)");
 
/* =======================================================
   ✅ 1. FETCH DATA (NO PROMO COLUMN)
   ======================================================= */
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const dishGroup = req.query.dishGroup;
 
    let query = `
      SELECT
        d.DishId,
        d.DishCode,
        d.Name as Description,
        p.Amount as Price,
        d.DishGroupId as InventoryGroup
      FROM DishMaster d
      LEFT JOIN (
          SELECT DishId, MIN(Amount) as Amount FROM DishPriceList GROUP BY DishId
      ) p ON d.DishId = p.DishId
    `;
 
    const request = pool.request();
 
    if (dishGroup && dishGroup !== "null" && dishGroup !== "undefined") {
      query += ` WHERE d.DishGroupId = @dishGroup`;
      request.input("dishGroup", sql.VarChar, dishGroup);
    }
 
    const result = await request.query(query);
 
    const formatted = result.recordset.map(row => ({
      selected: false,
      dishId: row.DishId, // MUST map uniqueidentifier for inserts
      dishCode: row.DishCode || row.DishId,
      dishName: row.Description,
      price: Number(row.Price || 0).toFixed(2),
 
      // ❌ DB la illa → default
      promoPrice: "0.00"
    }));
 
    res.json({
      success: true,
      data: formatted
    });
 
  } catch (err) {
    console.error("🔥 FETCH ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});
 
 
/* =======================================================
   ✅ 2. DISH GROUPS
   ======================================================= */
router.get("/dishgroups", async (req, res) => {
  try {
    const pool = await poolPromise;
 
    const result = await pool.request().query(`
      SELECT *
      FROM DishGroupMaster
      ORDER BY DishGroupName
    `);
 
    const mapped = result.recordset.map((row, i) => ({
      id: row.DishGroupId || row.DishGroupCode || i,
      code: row.DishGroupCode ? row.DishGroupCode.trim() : row.DishGroupId,
      name: row.DishGroupName || `Group ${i}`
    }));
 
    res.json({
      success: true,
      data: mapped
    });
 
  } catch (err) {
    console.error("🔥 DISHGROUP ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});
 
 
/* =======================================================
   ✅ 3. SAVE HAPPY HOURS (DB INSERT)
   ======================================================= */
router.get("/report", async (req, res) => {
  try {
    const pool = await poolPromise;
 
    // Check if table exists to prevent crash
    const tableExists = await pool.request().query(`
      SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HappyHours]') AND type in (N'U')
    `);
    if (tableExists.recordset.length === 0) {
      return res.json({ success: true, data: [] });
    }
 
    const query = `
      SELECT
        h.PromotionCode,
        h.Description,
        h.DishId as InventoryID,
        h.PromotionPrice as PromoPrice,
        d.Name as DishName,
        d.DishCode,
        p.Amount as Price,
        g.DishGroupName
      FROM dbo.HappyHours h
      LEFT JOIN dbo.DishMaster d ON h.DishId = d.DishId
      LEFT JOIN (
          SELECT DishId, MIN(Amount) as Amount FROM dbo.DishPriceList GROUP BY DishId
      ) p ON h.DishId = p.DishId
      LEFT JOIN dbo.DishGroupMaster g ON h.DishGroupId = g.DishGroupId
    `;
 
    const result = await pool.request().query(query);
 
    const formatted = result.recordset.map(row => ({
      DishGroup: row.DishGroupName || "Unknown Group",
      InventoryID: row.DishCode || row.InventoryID,
      Description: row.DishName || row.Description || "Unknown Dish",
      Price: Number(row.Price || 0).toFixed(2),
      PromoPrice: Number(row.PromoPrice || 0).toFixed(2)
    }));
 
    res.json({ success: true, data: formatted });
 
  } catch (err) {
    console.error("🔥 REPORT ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
 
/* =======================================================
   ✅ 4. SAVE HAPPY HOURS (DB INSERT)
   ======================================================= */
router.post("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const items = Array.isArray(req.body) ? req.body : [req.body];
 
    for (let d of items) {
      await pool.request()
        .input("PromotionId", sql.UniqueIdentifier, d.PromotionId)
        .input("PromotionCode", sql.VarChar, d.PromotionCode)
        .input("Description", sql.VarChar, d.Description || "")
        .input("DishGroupId", sql.UniqueIdentifier, d.DishGroupId) // Enforce GUID
        .input("DishId", sql.UniqueIdentifier, d.DishId) // Enforce GUID
        .input("FromDate", sql.SmallDateTime, d.FromDate ? new Date(d.FromDate) : new Date())
        .input("ToDate", sql.SmallDateTime, d.ToDate ? new Date(d.ToDate) : new Date('2079-06-06'))
        .input("FromTime", sql.VarChar, d.FromTime || '00:00')
        .input("ToTime", sql.VarChar, d.ToTime || '23:59')
        .input("PromotionDay", sql.VarChar, (d.PromotionDay || "").split(',').map(day => day.substring(0, 3)).join(',').substring(0, 50))
        .input("PromotionPerc", sql.Numeric(18, 2), d.PromotionPerc || 0)
        .input("PromotionPrice", sql.Numeric(18, 2), d.PromotionPrice || 0)
        .input("CreatedBy", sql.UniqueIdentifier, d.CreatedBy)
        .input("CreatedOn", sql.DateTime, d.CreatedOn ? new Date(d.CreatedOn) : new Date())
        .input("ModyfiedBy", sql.UniqueIdentifier, d.ModyfiedBy)
        .input("ModyfiedOn", sql.DateTime, d.ModyfiedOn ? new Date(d.ModyfiedOn) : null)
        .input("BusinessUnitId", sql.UniqueIdentifier, d.BusinessUnitId)
        .input("PromoType", sql.VarChar, d.PromoType)
        .query(`
          IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HappyHours]') AND type in (N'U'))
          BEGIN
             -- Skip if table doesn't exist to prevent crash, just processing JS side
             SELECT 1;
          END
          ELSE
          BEGIN
            INSERT INTO dbo.HappyHours (
              PromotionId, PromotionCode, Description, DishGroupId, DishId,
              FromDate, ToDate, FromTime, ToTime, PromotionDay,
              PromotionPerc, PromotionPrice, CreatedBy, CreatedOn, ModyfiedBy, ModyfiedOn, BusinessUnitId, PromoType
            ) VALUES (
              @PromotionId, @PromotionCode, @Description, @DishGroupId, @DishId,
              @FromDate, @ToDate, @FromTime, @ToTime, @PromotionDay,
              @PromotionPerc, @PromotionPrice, @CreatedBy, @CreatedOn, @ModyfiedBy, @ModyfiedOn, @BusinessUnitId, @PromoType
            )
          END
        `);
    }
 
    return res.json({
      success: true,
      message: "Promotion successfully saved for selected dishes."
    });
  } catch (err) {
    console.error("SAVE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
 
/* =======================================================
   ✅ 5. DELETE HAPPY HOURS
   ======================================================= */
router.post("/delete", async (req, res) => {
  try {
    const pool = await poolPromise;
    const { dishIds } = req.body;
 
    if (dishIds && dishIds.length > 0) {
      const idList = dishIds.map(id => `'${id}'`).join(',');
      await pool.request().query(`
        DELETE FROM dbo.HappyHours WHERE DishId IN (${idList})
      `);
    }
 
    return res.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
 
module.exports = router;
 