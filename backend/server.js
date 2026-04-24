if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const cors = require("cors");
const { sql, poolPromise } = require("./db");
const { v4: uuidv4 } = require("uuid");
const multer = require('multer'); 
const path = require("path");
const fs = require("fs");


const app = express();

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// app.use(cors());
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

const inventoryRoutes = require("./routes/inventory");

app.use("/inventory", inventoryRoutes);

// const settlementRoutes = require("./routes/settlement");

// app.use("/settlement", settlementRoutes);

app.use("/images", express.static(path.join(__dirname, "images")));

const dashboardRoutes = require("./routes/dashboard");

app.use("/api", dashboardRoutes);

const rewardRoutes = require("./routes/rewardRoutes");

app.use("/api/rewardpoints", rewardRoutes);

const vendorRoutes = require("./routes/vendorRoutes");
 
// 🔥 USE ROUTES
app.use("/api/vendor", vendorRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api", userRoutes);


const userGroupRoutes = require("./routes/userGroupRoutes");
app.use("/api/usergroup", userGroupRoutes);

const login = require("./routes/login");

app.use("/api", login);

const paymodeRoutes = require("./routes/paymodeRoutes");
app.use("/api/paymode", paymodeRoutes);

const picklistRoutes = require("./routes/picklistRoutes");
app.use("/api", picklistRoutes);

const settlementRoutes = require("./routes/settlementRoutes");
app.use("/api/settlement", settlementRoutes);

const terminalRoutes = require("./routes/terminalRoutes");
app.use("/api/terminal", terminalRoutes);

const customerRoutes = require("./routes/Customer");

app.use("/api/customer", customerRoutes);

// 🔥 FireCourse Route connect
const firecourseRoutes = require("./routes/firecourse");
app.use("/api/firecourse", firecourseRoutes);

const discountRoutes = require("./routes/discountRoutes");
app.use("/api/discount", discountRoutes);

const emailRoutes = require("./routes/EmailSettings");
 
app.use("/api/email-settings", emailRoutes);

const changePasswordRoutes = require("./routes/changePasswordRoutes");
app.use("/api/change-password", changePasswordRoutes);

const priceListRoutes = require("./routes/priceListRoutes");
app.use("/api/pricelist", priceListRoutes)
 
const printerRoutes = require("./routes/printer");

app.use("/api/printer", printerRoutes);

const barcodeRoutes = require("./routes/barcodeRoutes");
 
app.use("/api/barcode", barcodeRoutes);

const timeEntryRoutes = require("./routes/timeEntry");
app.use("/api/timeEntry", timeEntryRoutes);

const cancelRoutes = require("./routes/cancelRemarks");
app.use("/api/cancelRemarks", cancelRoutes);

const permissionRoutes = require("./routes/permissionRoutes"); 

app.use("/api", permissionRoutes);

const happyhoursRoutes = require("./routes/happyhours");
app.use("/api/happyhours", happyhoursRoutes);

const posRoutes = require("./routes/posPermissionRoutes");
app.use("/api/pos-permission", posRoutes);
 
const stockRoutes = require("./routes/stock");
app.use("/api/stock", stockRoutes);

const transstockRoutes = require("./routes/transstockRoutes");
app.use("/api/transstockRoutes", transstockRoutes);

/* ------------------- GET ALL KITCHENS ------------------- */
app.get("/kitchen", async (req, res) => {
  try {
    const { KitchenTypeCode } = req.query; // optional filter
    const pool = await poolPromise;

    // Base query
    let query = `
      SELECT KitchenTypeId, KitchenTypeCode, KitchenTypeName, isActive
      FROM Kitchen 
    `;

    // Add WHERE only if KitchenTypeCode is provided
    if (KitchenTypeCode) {
      query += " WHERE KitchenTypeCode = @KitchenTypeCode";
    }

    query += " ORDER BY KitchenTypeCode DESC";

    const request = pool.request();

    // Bind input parameter correctly
    if (KitchenTypeCode) {
      // Use INT if KitchenTypeCode is numeric in SQL
      request.input("KitchenTypeCode", sql.Int, parseInt(KitchenTypeCode));
    }

    // Optional: measure query time
    // console.time("KitchenQuery");
    const result = await request.query(query);
    // console.timeEnd("KitchenQuery");

    res.json(result.recordset);
  } catch (err) {
  console.error("🔥 KITCHEN ERROR FULL:", err);

  res.status(500).json({
    message: "Kitchen API Failed",
    error: err.message,
    stack: err.stack
  });
}
 });
//   catch (err) {
//     console.error("Error fetching kitchens:", err);
//      res.status(500).send("Server Error");
//   }
// });

/* ------------------- GET NEXT KITCHEN CODE ------------------- */
app.get("/kitchen/nextcode", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT NextNumber
      FROM Autonumbers
      WHERE TableName='KitchenType'
      AND FieldName='KitchenTypeCode'
    `);

    res.json(result.recordset[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

/* ------------------- CREATE KITCHEN ------------------- */
app.post("/kitchen", async (req, res) => {
  try {
    const {
      KitchenTypeCode,
      KitchenTypeName,
      isActive,
      BusinessUnitId,
      CreatedBy
    } = req.body;

    if (!KitchenTypeCode || !KitchenTypeName) {
      return res.status(400).send("Kitchen code and name required");
    }
      
   const pool = await poolPromise;
    const KitchenTypeId = uuidv4();

    await pool.request()
      .input("KitchenTypeId", sql.UniqueIdentifier, KitchenTypeId)
      .input("KitchenTypeCode", sql.Numeric(18, 0), KitchenTypeCode)
      .input("KitchenTypeName", sql.VarChar(100), KitchenTypeName)
      .input("isActive", sql.Bit, isActive)
      .input("BusinessUnitId", sql.UniqueIdentifier, BusinessUnitId)
      .input("CreatedBy", sql.UniqueIdentifier, CreatedBy)
      .input("CreatedOn", sql.DateTime, new Date())
      .query(`
        INSERT INTO Kitchen
        (KitchenTypeId, KitchenTypeCode, KitchenTypeName, isActive, BusinessUnitId, CreatedBy, CreatedOn)
        VALUES
        (@KitchenTypeId, @KitchenTypeCode, @KitchenTypeName, @isActive, @BusinessUnitId, @CreatedBy, GETDATE())
      `);

    // Update Autonumber
    await pool.request().query(`
      UPDATE Autonumbers
      SET NextNumber = NextNumber + 1
      WHERE TableName='KitchenType'
      AND FieldName='KitchenTypeCode'
    `);

    res.json({ message: "Kitchen Created Successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).send("Save failed");
  }
});

/* ------------------- UPDATE KITCHEN ------------------- */
app.put("/kitchen/:id", async (req, res) => {
  try {
    const KitchenTypeId = req.params.id;
    const {
      KitchenTypeCode,
      KitchenTypeName,
      isActive,
      ModifiedBy
    } = req.body;

    if (!KitchenTypeCode || !KitchenTypeName) {
      return res.status(400).send("Kitchen code and name required");
    }

    const pool = await poolPromise;

    await pool.request()
      .input("KitchenTypeId", sql.UniqueIdentifier, KitchenTypeId)
      .input("KitchenTypeCode", sql.Numeric(18, 0), KitchenTypeCode)
      .input("KitchenTypeName", sql.VarChar(100), KitchenTypeName)
      .input("isActive", sql.Bit, isActive)
      .input("ModifiedBy", sql.UniqueIdentifier, ModifiedBy)
      .input("ModifiedOn", sql.DateTime, new Date())
      .query(`
        UPDATE Kitchen
        SET
          KitchenTypeCode = @KitchenTypeCode,
          KitchenTypeName = @KitchenTypeName,
          isActive = @isActive,
          ModifiedBy = @ModifiedBy,
          ModifiedOn = @ModifiedOn
        WHERE KitchenTypeId = @KitchenTypeId
      `);

    res.json({ message: "Kitchen Updated Successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).send("Update failed");
  }
});

/* ------------------- DELETE KITCHEN ------------------- */
app.delete("/kitchen/:id", async (req, res) => {
  try {
    const KitchenTypeId = req.params.id;
    const pool = await poolPromise;

    // Check dish mapping
    const check = await pool.request()
      .input("KitchenTypeId", sql.UniqueIdentifier, KitchenTypeId)
      .query(`
        SELECT *
        FROM DishKitchenType
        WHERE KitchenTypeId = @KitchenTypeId
      `);

    if (check.recordset.length > 0) {
      return res.status(400).json({
        message: "Dish list having this kitchen type. Cannot delete"
      });
    }

    await pool.request()
      .input("KitchenTypeId", sql.UniqueIdentifier, KitchenTypeId)
      .query(`
        DELETE FROM Kitchen
        WHERE KitchenTypeId = @KitchenTypeId
      `);

    res.json({ message: "Kitchen Deleted Successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).send("Delete failed");
  }
});
//======================================================END KITCHEN----============

//-============================================start CATEGORIES==============

// --- Multer config for image upload ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "images", "Dish");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,   // ✅ 10MB image
    fieldSize: 20 * 1024 * 1024   // ✅ FIX for "Field value too long"
  }
});

// ---------------- GET ALL CATEGORIES ----------------
app.get("/category", async (req, res) => {
  try {
    const { CategoryCode } = req.query;
    const pool = await poolPromise;
    let query = `SELECT 
                  C.*,
                  (SELECT I.ImageData
                  from ImageList I
                  where  C.ImageId = I.ImageId) ImageData
                  FROM CategoryMaster C ORDER BY CategoryCode DESC;`;

    if (CategoryCode) query += " WHERE CategoryCode = @CategoryCode";
    const request = pool.request();
    if (CategoryCode) request.input("CategoryCode", sql.VarChar, CategoryCode);
    const result = await request.query(query);
    const data = result.recordset.map(row => {
  let imageBase64 = null;

  if (row.ImageData) {
    imageBase64 = `data:image/jpeg;base64,${row.ImageData.toString("base64")}`;
  }

  return {
    ...row,
    ImageData: imageBase64
  };
});

res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// ---------------- CREATE / UPDATE CATEGORY ----------------
app.post("/category", upload.single("image"), async (req, res) => {
  try {
    const {
      CategoryId,
      CategoryCode,
      CategoryName,
      SortCode,
      isActive,
      ShortName,
      KitchenTypes,
      Modifiers,
      BackColor,
      ForeColor,
      isKitchenPrint,
      isDiscountAllowed,
      isServiceCharge,
      isDispName,
      isMemberSalesAllowed,
      isTaxAllowed,
      NameInOtherLanguage,
    } = req.body;

 const safeBackColor =
  typeof BackColor === "string" && BackColor.startsWith("#")
    ? BackColor
    : "#000000";

const safeForeColor =
  typeof ForeColor === "string" && ForeColor.startsWith("#")
    ? ForeColor
    : "#ffffff";
    const pool = await poolPromise;
   let catId = CategoryId;

if (!catId || catId === "") {
  catId = uuidv4();
}

    let imageId = null;
    let imageName = null;

    if (req.file) {
      imageId = uuidv4();
      imageName = req.file.filename;
      const imageBuffer = fs.readFileSync(req.file.path);
      await pool
        .request()
        .input("ImageId", sql.UniqueIdentifier, imageId)
        .input("ImageName", sql.VarChar(100), imageName)
         .input("ImageData", sql.VarBinary(sql.MAX), imageBuffer)
        .query("INSERT INTO ImageList (ImageId, ImageName,ImageData) VALUES (@ImageId, @ImageName,@ImageData)");
    }

    // Check if updating or creating
    const exists = await pool
      .request()
      .input("CategoryId", sql.UniqueIdentifier, catId)
      .query("SELECT CategoryId FROM CategoryMaster WHERE CategoryId=@CategoryId");

   if (exists.recordset.length > 0) {

let request = pool.request()
.input("CategoryId", sql.UniqueIdentifier, catId)
.input("CategoryCode", sql.VarChar(20), (CategoryCode || "").substring(0,20))
.input("CategoryName", sql.VarChar(100), (CategoryName || "").substring(0,100))
.input("SortCode", sql.Int, SortCode)
.input("isActive", sql.Bit, Number(isActive) === 1)
.input("ShortName", sql.VarChar(50), (ShortName || "").substring(0,50))
.input("BackColor", sql.NVarChar(50), safeBackColor)
.input("ForeColor", sql.NVarChar(50), safeForeColor)
.input("isKitchenPrint", sql.Bit, Number(isKitchenPrint) === 1)
.input("isDiscountAllowed", sql.Bit, Number(isDiscountAllowed) === 1)
.input("isServiceCharge", sql.Bit, Number(isServiceCharge) === 1)
.input("isDispName", sql.Bit, Number(isDispName) === 1)
.input("isMemberSalesAllowed", sql.Bit, Number(isMemberSalesAllowed) === 1)
.input("isTaxAllowed", sql.Bit, Number(isTaxAllowed) === 1)
.input("NameInOtherLanguage", sql.VarChar(100), NameInOtherLanguage);

// ⭐ only add ImageId if new image uploaded
request.input("ImageId", sql.UniqueIdentifier, imageId || null);

await request.query(`
UPDATE CategoryMaster SET
CategoryCode=@CategoryCode,
CategoryName=@CategoryName,
SortCode=@SortCode,
isActive=@isActive,
ShortName=@ShortName,
ImageId = COALESCE(@ImageId, ImageId),  
BackColor=@BackColor,
ForeColor=@ForeColor,
isKitchenPrint=@isKitchenPrint,
isDiscountAllowed=@isDiscountAllowed,
isServiceCharge=@isServiceCharge,
isDispName=@isDispName,
isMemberSalesAllowed=@isMemberSalesAllowed,
isTaxAllowed=@isTaxAllowed,
NameInOtherLanguage=@NameInOtherLanguage
WHERE CategoryId=@CategoryId
`);
  } else {
      // Insert
      await pool
        .request()
        .input("CategoryId", sql.UniqueIdentifier, catId)
        .input("CategoryCode", sql.VarChar(20), CategoryCode)
        .input("CategoryName", sql.VarChar(100), CategoryName)
        .input("SortCode", sql.Int, SortCode)
        .input("isActive", sql.Bit, isActive ?? false)
        .input("ShortName", sql.VarChar(50), ShortName)
        .input("ImageId", sql.UniqueIdentifier, imageId)
        .input("BackColor", sql.NVarChar(50), safeBackColor)
        .input("ForeColor", sql.NVarChar(50), safeForeColor)
        .input("isKitchenPrint", sql.Bit, isKitchenPrint ?? false)
        .input("isDiscountAllowed", sql.Bit, isDiscountAllowed ?? false)
        .input("isServiceCharge", sql.Bit, isServiceCharge ?? false)
        .input("isDispName", sql.Bit, isDispName ?? false)
        .input("isMemberSalesAllowed", sql.Bit, isMemberSalesAllowed ?? false)
        .input("isTaxAllowed", sql.Bit, isTaxAllowed ?? false)
        .input("NameInOtherLanguage", sql.VarChar(100), NameInOtherLanguage)
        .input("CreatedBy", sql.UniqueIdentifier, uuidv4())
        .input("CreatedOn", sql.DateTime, new Date())
        .query(
          `INSERT INTO CategoryMaster 
                (CategoryId, CategoryCode, CategoryName, SortCode, isActive, ShortName, ImageId, BackColor, ForeColor, isKitchenPrint, isDiscountAllowed, isServiceCharge, isDispName, isMemberSalesAllowed, isTaxAllowed, NameInOtherLanguage, CreatedBy, CreatedOn) 
            VALUES 
            (@CategoryId, @CategoryCode, @CategoryName, @SortCode, @isActive, @ShortName, @ImageId, @BackColor, @ForeColor, @isKitchenPrint, @isDiscountAllowed, @isServiceCharge, @isDispName, @isMemberSalesAllowed, @isTaxAllowed, @NameInOtherLanguage, @CreatedBy, @CreatedOn)`
        );
    }

    // Save Modifiers
    await pool.request()
.input("CategoryId", sql.UniqueIdentifier, catId)
.query("DELETE FROM CategoryModifier WHERE CategoryId=@CategoryId");
    if (Modifiers && Array.isArray(JSON.parse(Modifiers))) {
      const mods = JSON.parse(Modifiers);
      for (let modId of mods) {
        await pool
          .request()
          .input("CategoryId", sql.UniqueIdentifier, catId)
          .input("ModifierId", sql.UniqueIdentifier, modId)
          .query("INSERT INTO CategoryModifier (CategoryId, ModifierId) VALUES (@CategoryId, @ModifierId)");
      }
    }

    // Save KitchenTypes

await pool.request()
.input("CategoryId", sql.UniqueIdentifier, catId)
.query("DELETE FROM CategoryKitchenType WHERE CategoryId=@CategoryId");

let kitchens = [];

if (KitchenTypes) {
  kitchens = typeof KitchenTypes === "string"
    ? JSON.parse(KitchenTypes)
    : KitchenTypes;
}

if (Array.isArray(kitchens)) {
for (let kt of kitchens) {

await pool.request()
.input("CategoryId", sql.UniqueIdentifier, catId)
.input("KitchenTypeCode", sql.Int, kt.KitchenTypeCode)
.input("KitchenTypeName", sql.VarChar(100), kt.KitchenTypeName)
.query(`
IF NOT EXISTS (
SELECT 1 FROM CategoryKitchenType
WHERE CategoryId=@CategoryId
AND KitchenTypeCode=@KitchenTypeCode
)
INSERT INTO CategoryKitchenType
(CategoryId,KitchenTypeCode,KitchenTypeName)
VALUES
(@CategoryId,@KitchenTypeCode,@KitchenTypeName)
`);

}
}

    res.json({ message: "Category saved successfully", CategoryId: catId });
  } catch (err) {
  console.error("FULL ERROR:", err.message);

  // ✅ Truncation error
  if (err.message.includes("String or binary data would be truncated")) {
    return res.status(400).json({
      message: "Category Name or Short Name is too long (max limit exceeded)"
    });
  }

  // ✅ Image / multer error
  if (err.message.includes("Field value too long")) {
    return res.status(400).json({
      message: "Image size is too large. Please upload smaller file"
    });
  }

  // ✅ Default error
  res.status(500).json({
    message: "Category save failed. Please try again"
  });
}
});
/* ---------------- CATEGORY KITCHEN INSERT / DELETE ---------------- */

app.post("/categorykitchen", async (req, res) => {

  try {

    const { CategoryId, KitchenTypeCode, KitchenTypeName, checked } = req.body;

    const pool = await poolPromise;

    if (checked) {

      // INSERT
      await pool.request()
        .input("CategoryId", sql.UniqueIdentifier, CategoryId)
        .input("KitchenTypeCode", sql.Int, KitchenTypeCode)
        .input("KitchenTypeName", sql.VarChar(100), KitchenTypeName)
        .query(`
          INSERT INTO CategoryKitchenType
          (CategoryId, KitchenTypeCode, KitchenTypeName)
          VALUES
          (@CategoryId,@KitchenTypeCode,@KitchenTypeName)
        `);

    } else {

      // DELETE
      await pool.request()
        .input("CategoryId", sql.UniqueIdentifier, CategoryId)
        .input("KitchenTypeCode", sql.Int, KitchenTypeCode)
        .query(`
          DELETE FROM CategoryKitchenType
          WHERE CategoryId=@CategoryId
          AND KitchenTypeCode=@KitchenTypeCode
        `);

    }

    res.json({ message: "Kitchen updated successfully" });

  } catch (err) {

    console.log(err);
    res.status(500).send("Error");

  }

});
//kitchen code ------------------

app.get("/categorykitchen/:id", async (req,res)=>{
try{

const pool = await poolPromise;

const result = await pool.request()
.input("CategoryId", sql.UniqueIdentifier, req.params.id)
.query(`
SELECT KitchenTypeCode
FROM CategoryKitchenType
WHERE CategoryId=@CategoryId
`);

res.json(result.recordset);

}catch(err){

console.log(err);
res.status(500).send("error");

}
});

//------MODIFIER

app.get("/modifier", async (req,res)=>{

try{

const pool = await poolPromise;

const result = await pool.request().query(`
SELECT ModifierId,ModifierName
FROM ModifierMaster
ORDER BY ModifierName
`);

res.json(result.recordset);

}catch(err){

console.log(err);
res.status(500).send("error");

}

});

//----categorymodifier

app.post("/categorymodifier", async (req,res)=>{

try{

const { CategoryId, ModifierId, checked } = req.body;

const pool = await poolPromise;

if(checked){

await pool.request()
.input("CategoryId", sql.UniqueIdentifier, CategoryId)
.input("ModifierId", sql.UniqueIdentifier, ModifierId)
.query(`
INSERT INTO CategoryModifier
(CategoryId,ModifierId)
VALUES
(@CategoryId,@ModifierId)
`);

}else{

await pool.request()
.input("CategoryId", sql.UniqueIdentifier, CategoryId)
.input("ModifierId", sql.UniqueIdentifier, ModifierId)
.query(`
DELETE FROM CategoryModifier
WHERE CategoryId=@CategoryId
AND ModifierId=@ModifierId
`);

}

res.json({message:"Modifier updated"});

}catch(err){

console.log(err);
res.status(500).send("error");

}

});

app.get("/categorymodifier/:id", async (req,res)=>{

try{

const pool = await poolPromise;

const result = await pool.request()
.input("CategoryId", sql.UniqueIdentifier, req.params.id)
.query(`
SELECT ModifierId
FROM CategoryModifier
WHERE CategoryId=@CategoryId
`);

res.json(result.recordset);

}catch(err){

console.log(err);
res.status(500).send("error");

}

});

// ---------------- DELETE CATEGORY ----------------
app.delete("/category/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    // Check mapping before delete
    const check = await pool
      .request()
      .input("CategoryId", sql.UniqueIdentifier, id)
      .query("SELECT * FROM DishGroupMaster WHERE CategoryId=@CategoryId");

    if (check.recordset.length > 0)
      return res.status(400).json({ message: "Category has DishGroup mapping. Cannot delete." });

    await pool.request().input("CategoryId", sql.UniqueIdentifier, id).query("DELETE FROM CategoryMaster WHERE CategoryId=@CategoryId");

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Delete failed");
  }
});
//==============================================END Category=============================

//===============================================start dishgroup==========================

//dishgroup get

app.get("/dishgroup", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        C.DishGroupId,
        C.DishGroupCode,
        C.DishGroupName,
        C.ShortName,
        ISNULL(C.isActive, 0) AS isActive,
        ISNULL(C.isDiscountAllowed, 0) AS isDiscountAllowed,
        ISNULL(C.isTaxAllowed, 0) AS isTaxAllowed,
        ISNULL(C.isKitchenPrint, 0) AS isKitchenPrint,
        ISNULL(C.isServiceCharge, 0) AS isServiceCharge,
        ISNULL(C.isMemberSalesAllowed, 0) AS isMemberSalesAllowed,
        ISNULL(C.ShowModifierTabOrder, 0) AS ShowModifierTabOrder,
        ISNULL(C.SortCode, 0) AS SortCode,
        ISNULL(C.KitchenSortCode, 0) AS KitchenSortCode,
        C.CategoryId,
        C.BackColor,
        C.ForeColor,
         (SELECT I.ImageData
                  from ImageList I
                  where  C.ImageId = I.ImageId) ImageData
      FROM DishGroupMaster C
     ORDER BY C.DishGroupCode DESC
    `);

 const data = result.recordset.map(row => {
  let imageBase64 = null;

  if (row.ImageData) {
    imageBase64 = `data:image/jpeg;base64,${row.ImageData.toString("base64")}`;
  }

  return {
    ...row,
    ImageData: imageBase64
  };
});

res.json(data);

  } catch (err) {
    console.log(err);
    res.status(500).send("Error");
  }
});

 app.get("/dishgroup/nextcode", async (req, res) => {
  try {
    console.log("NEXTCODE API HIT");

    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        ISNULL(MAX(TRY_CAST(DishGroupCode AS INT)), 0) + 1 AS NewCode
      FROM DishGroupMaster
    `);

    res.json({ code: result.recordset[0].NewCode });

  } catch (err) {
    console.log("NEXTCODE ERROR FULL:", err);
    res.status(500).json({ error: err.message });
  }
});
//GET DishGroup by ID (Edit screen)

app.get("/dishgroup/:id", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("DishGroupId", sql.UniqueIdentifier, req.params.id)
      .query(`
        SELECT *
        FROM DishGroupMaster
        WHERE DishGroupId=@DishGroupId
      `);

    res.json(result.recordset[0]);

  } catch (err) {
    console.log(err);
    res.status(500).send("Error");
  }
});
//CREATE / UPDATE DishGroup (MAIN 🔥)
app.post("/dishgroup", upload.single("image"), async (req, res) => {
  try {
    const {
      DishGroupId,
      DishGroupCode,
      DishGroupName,
      SortCode,
      isActive,
      isDiscountAllowed,      
      isTaxAllowed,           
      isKitchenPrint,         
      isServiceCharge,        
      isMemberSalesAllowed,   
      ShortName,
      CategoryId,
      KitchenSortCode,
      BackColor,
      ForeColor,
      Modifiers,
      KitchenTypes
    } = req.body;

    const pool = await poolPromise;
    // 🔥 AUTO GENERATE CODE (ADD HERE)
const codeResult = await pool.request().query(`
  SELECT 
    ISNULL(MAX(TRY_CAST(DishGroupCode AS INT)), 0) + 1 AS NewCode
  FROM DishGroupMaster
`);

const newCode = codeResult.recordset[0].NewCode;
    let imageId = null;

if (req.file) {
  imageId = uuidv4();
const imageBuffer = fs.readFileSync(req.file.path);
  await pool.request()
    .input("ImageId", sql.UniqueIdentifier, imageId)
    .input("ImageName", sql.VarChar(100), req.file.filename)
    .input("ImageData", sql.VarBinary(sql.MAX), imageBuffer)
    .query(`
      INSERT INTO ImageList (ImageId, ImageName,ImageData)
      VALUES (@ImageId, @ImageName,@ImageData)
    `);
}

    let dgId = DishGroupId || uuidv4();

    // check exists
    const exists = await pool.request()
      .input("DishGroupId", sql.UniqueIdentifier, dgId)
      .query("SELECT DishGroupId FROM DishGroupMaster WHERE DishGroupId=@DishGroupId");

    if (exists.recordset.length > 0) {

      // 🔄 UPDATE
      await pool.request()
        .input("DishGroupId", sql.UniqueIdentifier, dgId)
         .input("DishGroupCode", sql.VarChar(20), DishGroupCode)
        .input("DishGroupName", sql.VarChar(100), DishGroupName)
        .input("SortCode", sql.Int, SortCode)
        .input("isActive", sql.Bit, isActive == 1)
        .input("isDiscountAllowed", sql.Bit, isDiscountAllowed == 1)
        .input("isTaxAllowed", sql.Bit, isTaxAllowed == 1)
        .input("isKitchenPrint", sql.Bit, isKitchenPrint == 1)
        .input("isServiceCharge", sql.Bit, isServiceCharge == 1)
        .input("isMemberSalesAllowed", sql.Bit, isMemberSalesAllowed == 1)
        .input("ShortName", sql.VarChar(50), ShortName)
        .input(
        "CategoryId",
        sql.UniqueIdentifier,
        CategoryId && CategoryId !== "null" ? CategoryId : null
      )
        .input("KitchenSortCode", sql.Int, KitchenSortCode)
        .input("BackColor", sql.VarChar(50), BackColor)
        .input("ForeColor", sql.VarChar(50), ForeColor)
        .input("ImageId", sql.UniqueIdentifier, imageId)
        .query(`
         UPDATE DishGroupMaster SET
                DishGroupCode=@DishGroupCode,
                DishGroupName=@DishGroupName,
                SortCode=@SortCode,
                isActive=@isActive,
                isDiscountAllowed=@isDiscountAllowed,
                isTaxAllowed=@isTaxAllowed,
                isKitchenPrint=@isKitchenPrint,
                isServiceCharge=@isServiceCharge,
                isMemberSalesAllowed=@isMemberSalesAllowed,
                ShortName=@ShortName,
                CategoryId=@CategoryId,
                KitchenSortCode=@KitchenSortCode,
                BackColor=@BackColor,
                ForeColor=@ForeColor,
                ImageId = COALESCE(@ImageId, ImageId)
                WHERE DishGroupId=@DishGroupId
        `);

    } else {

      // 🆕 INSERT
      await pool.request()
        .input("DishGroupId", sql.UniqueIdentifier, dgId)
        .input("DishGroupCode", sql.VarChar(20), String(newCode))
        .input("DishGroupName", sql.VarChar(100), DishGroupName)
        .input("SortCode", sql.Int, SortCode)
        .input("isActive", sql.Bit, isActive == 1)
        .input("isDiscountAllowed", sql.Bit, isDiscountAllowed == 1)
        .input("isTaxAllowed", sql.Bit, isTaxAllowed == 1)
        .input("isKitchenPrint", sql.Bit, isKitchenPrint == 1)
        .input("isServiceCharge", sql.Bit, isServiceCharge == 1)
        .input("isMemberSalesAllowed", sql.Bit, isMemberSalesAllowed == 1)
        .input("ShortName", sql.VarChar(50), ShortName || "")
        .input(
          "CategoryId",
          sql.UniqueIdentifier,
          CategoryId && CategoryId !== "null" ? CategoryId : null
        )
        .input("KitchenSortCode", sql.Int, KitchenSortCode)
        .input("BackColor", sql.VarChar(50), BackColor || "#000000")
       .input("ForeColor", sql.VarChar(50), ForeColor || "#ffffff")
        .input("ImageId", sql.UniqueIdentifier, imageId)
      //  .input("KitchenType", sql.VarChar(50), "")
      //  .input("SubkitchenType", sql.VarChar(50), "")
       .input("CreatedBy", sql.UniqueIdentifier, uuidv4())
        .input("CreatedOn", sql.DateTime, new Date())
        .query(`
          INSERT INTO DishGroupMaster
          (DishGroupId,DishGroupCode,DishGroupName,SortCode,isActive,ShortName,CategoryId,KitchenSortCode,BackColor,ForeColor,ImageId,isDiscountAllowed,
          isTaxAllowed,isKitchenPrint,isServiceCharge,isMemberSalesAllowed,CreatedBy, CreatedOn)
          VALUES
          (@DishGroupId,@DishGroupCode,@DishGroupName,@SortCode,@isActive,@ShortName,@CategoryId,@KitchenSortCode,@BackColor,@ForeColor,@ImageId,@isDiscountAllowed,
          @isTaxAllowed,@isKitchenPrint,@isServiceCharge,@isMemberSalesAllowed,@CreatedBy,@CreatedOn)
        `);
    }

    // 🔥 DELETE OLD MODIFIERS
    // ✅ DELETE OLD KITCHENS
await pool.request()
  .input("DishGroupId", sql.UniqueIdentifier, dgId)
  .query("DELETE FROM DishGroupKitchenType WHERE DishGroupId=@DishGroupId");

// ✅ INSERT KITCHENS
let kitchens = [];

if (KitchenTypes) {
  kitchens = typeof KitchenTypes === "string"
    ? JSON.parse(KitchenTypes)
    : KitchenTypes;
}

for (let k of kitchens) {
  await pool.request()
    .input("DishGroupId", sql.UniqueIdentifier, dgId)
    .input("KitchenTypeCode", sql.Int, k.KitchenTypeCode)
    .input("KitchenTypeName", sql.VarChar(100), k.KitchenTypeName || "")
    .query(`
      INSERT INTO DishGroupKitchenType
      (DishGroupId,KitchenTypeCode,KitchenTypeName)
      VALUES
      (@DishGroupId,@KitchenTypeCode,@KitchenTypeName)
    `);
}

    // 🔥 DELETE OLD KITCHENS
    // ✅ DELETE OLD MODIFIERS
await pool.request()
  .input("DishGroupId", sql.UniqueIdentifier, dgId)
  .query("DELETE FROM DishGroupModifier WHERE DishGroupId=@DishGroupId");

// ✅ INSERT MODIFIERS
let mods = [];

if (Modifiers) {
  mods = typeof Modifiers === "string"
    ? JSON.parse(Modifiers)
    : Modifiers;
}

for (let m of mods) {
  await pool.request()
    .input("DishGroupId", sql.UniqueIdentifier, dgId)
    .input("ModifierId", sql.UniqueIdentifier, m)
    .query(`
      INSERT INTO DishGroupModifier
      (DishGroupId,ModifierId)
      VALUES
      (@DishGroupId,@ModifierId)
    `);
}

    res.json({ message: "DishGroup saved successfully", DishGroupId: dgId });

  } catch (err) {
    console.log("🔥 FINAL ERROR FULL:", err);
    console.log("🔥 FINAL ERROR MSG:", err.message);

    res.status(500).json({
      error: err.message,
      stack: err.stack
    });
  }
});

//DELETE DishGroup
app.delete("/dishgroup/:id", async (req, res) => {
  try {
    const pool = await poolPromise;

    await pool.request()
      .input("DishGroupId", sql.UniqueIdentifier, req.params.id)
      .query("DELETE FROM DishGroupMaster WHERE DishGroupId=@DishGroupId");

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).send("Error");
  }
});

//ADD / REMOVE Modifier(DISH GROUP MODIFIER API)S
app.post("/dishgroupmodifier", async (req, res) => {
  try {
    const { DishGroupId, ModifierId, checked } = req.body;
    const pool = await poolPromise;

    if (checked) {
      // ✅ INSERT
      await pool.request()
        .input("DishGroupId", sql.UniqueIdentifier, DishGroupId)
        .input("ModifierId", sql.UniqueIdentifier, ModifierId)
        .query(`
          INSERT INTO DishGroupModifier
          (DishGroupId, ModifierId)
          VALUES
          (@DishGroupId, @ModifierId)
        `);
    } else {
      // ❌ DELETE
      await pool.request()
        .input("DishGroupId", sql.UniqueIdentifier, DishGroupId)
        .input("ModifierId", sql.UniqueIdentifier, ModifierId)
        .query(`
          DELETE FROM DishGroupModifier
          WHERE DishGroupId=@DishGroupId
          AND ModifierId=@ModifierId
        `);
    }

    res.json({ message: "DishGroup Modifier updated successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).send("Error");
  }
});
//GET Modifier List (DISH GROUP MODIFIER API)
app.get("/dishgroupmodifier/:id", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("DishGroupId", sql.UniqueIdentifier, req.params.id)
      .query(`
        SELECT ModifierId
        FROM DishGroupModifier
        WHERE DishGroupId=@DishGroupId
      `);

    res.json(result.recordset);

  } catch (err) {
    console.log(err);
    res.status(500).send("Error");
  }
});

//GET Kitchen List (DISH GROUP KITCHEN API)
app.get("/dishgroupkitchen/:id", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("DishGroupId", sql.UniqueIdentifier, req.params.id)
      .query(`
        SELECT KitchenTypeCode
        FROM DishGroupKitchenType
        WHERE DishGroupId=@DishGroupId
      `);

    res.json(result.recordset);

  } catch (err) {
    console.log(err);
    res.status(500).send("Error");
  }
});


//insert dishgroupkitchen

app.post("/dishgroupkitchen", async (req, res) => {
  try {
    const { DishGroupId, KitchenTypeCode, KitchenTypeName, checked } = req.body;

    const pool = await poolPromise; // 🔥 MISSING LINE (IMPORTANT)

    if (checked) {
      await pool.request()
        .input("DishGroupId", sql.UniqueIdentifier, DishGroupId)
        .input("KitchenTypeCode", sql.Int, KitchenTypeCode)
        .input("KitchenTypeName", sql.VarChar(100), KitchenTypeName)
        .query(`
          IF NOT EXISTS (
            SELECT 1 FROM DishGroupKitchenType
            WHERE DishGroupId=@DishGroupId AND KitchenTypeCode=@KitchenTypeCode
          )
          INSERT INTO DishGroupKitchenType
          (DishGroupId, KitchenTypeCode, KitchenTypeName)
          VALUES (@DishGroupId, @KitchenTypeCode, @KitchenTypeName)
        `);

    } else {
      await pool.request()
        .input("DishGroupId", sql.UniqueIdentifier, DishGroupId)
        .input("KitchenTypeCode", sql.Int, KitchenTypeCode)
        .query(`
          DELETE FROM DishGroupKitchenType
          WHERE DishGroupId=@DishGroupId AND KitchenTypeCode=@KitchenTypeCode
        `);
    }

    res.send("OK");

  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});
//===============================================END dishgroup==========================
//========================start dish================
// ================= GET =================
app.get("/dish", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT D.*,  (SELECT I.ImageData
                                                              from ImageList I
                                                              where  D.ImageId = I.ImageId) ImageData
                                               FROM DishMaster D
                                                ORDER BY TRY_CAST(D.DishCode AS INT) DESC`);
    const data = result.recordset.map(row => {
  let imageBase64 = null;

  if (row.ImageData) {
    imageBase64 = `data:image/jpeg;base64,${row.ImageData.toString("base64")}`;
  }

  return {
    ...row,
    ImageData: imageBase64
  };
});

res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/dish/nextcode", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        ISNULL(MAX(TRY_CAST(DishCode AS INT)), 0) + 1 AS NewCode
      FROM DishMaster
    `);

    res.json({ code: String(result.recordset[0].NewCode) });

  } catch (err) {
    console.log("DISH NEXTCODE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/dish", upload.single("image"), async (req, res) => {
  try {
    const pool = await poolPromise;
   const d = req.body;

    const dishId = d.DishId ? d.DishId : uuidv4();

    // 🔥 AUTO GENERATE DISH CODE (ADD HERE)
const codeResult = await pool.request().query(`
  SELECT 
    ISNULL(MAX(TRY_CAST(DishCode AS INT)), 0) + 1 AS NewCode
  FROM DishMaster
`);

const newDishCode = codeResult.recordset[0].NewCode;

    let imageId = null;

    // IMAGE SAVE
    if (req.file) {
      imageId = uuidv4();
      const imageBuffer = fs.readFileSync(req.file.path);

      await pool.request()
        .input("ImageId", sql.UniqueIdentifier, imageId)
        .input("ImageName", sql.VarChar(100), req.file.filename)
        .input("ImageData", sql.VarBinary(sql.MAX), imageBuffer)
        .query(`
          INSERT INTO ImageList (ImageId, ImageName, ImageData)
          VALUES (@ImageId, @ImageName, @ImageData)
        `);
    }

    // CHECK EXIST
    const exists = await pool.request()
      .input("DishId", sql.UniqueIdentifier, dishId)
      .query("SELECT DishId FROM DishMaster WHERE DishId=@DishId");

    if (exists.recordset.length > 0) {

      // 🔄 UPDATE (ALL COLUMNS)
      await pool.request()
        .input("DishId", sql.UniqueIdentifier, dishId)
        .input("DishCode", sql.NVarChar, d.DishCode || "")
        .input("Name", sql.NVarChar, d.Name || "")
        .input("ShortName", sql.NVarChar, d.ShortName || "")
        .input("Description", sql.NVarChar, d.Description || "")
        .input("DishGroupId", sql.UniqueIdentifier, d.DishGroupId || null)

        .input("CurrentCost", sql.Decimal(18,2), Number(d.CurrentCost) || 0)
        .input("SordCode", sql.Int, Number(d.SordCode) || 0)
        .input("UnitCost", sql.Decimal(18,2), Number(d.UnitCost) || 0)
        .input("QuantityOnHand", sql.Decimal(18,2), Number(d.QuantityOnHand) || 0)

        .input("NameInOtherLanguage", sql.NVarChar, d.NameInOtherLanguage || "")
        .input("ImageId", sql.UniqueIdentifier, imageId)
        .input("IsActive", sql.Bit, Number(d.IsActive) === 1)
        .input("iskitchenPrint", sql.Bit, Number(d.iskitchenPrint) === 1)
        .input("KitchenType", sql.Int, Number(d.KitchenType) || 0)
        .input("SubkitchenType", sql.Int, Number(d.SubkitchenType) || 0)
        .input("isDiscountAllowed", sql.Bit, Number(d.isDiscountAllowed) === 1)
        .input("IsTaxAllowed", sql.Bit, Number(d.IsTaxAllowed) === 1)
        .input("IsStockDish", sql.Bit, Number(d.IsStockDish) === 1)
        .input("isFOC", sql.Bit, Number(d.isFOC) === 1)
        .input("isServiceCharge", sql.Bit, Number(d.isServiceCharge) === 1)
        .input("isFavourite", sql.Bit, Number(d.isFavourite) === 1)
        .input("isMultiPrice", sql.Bit, Number(d.isMultiPrice) === 1)
        .input("isOpenitem", sql.Bit, Number(d.isOpenitem) === 1)

        .query(`
          UPDATE DishMaster SET
            DishCode=@DishCode,
            Name=@Name,
            ShortName=@ShortName,
            Description=@Description,
            DishGroupId=@DishGroupId,
            CurrentCost=@CurrentCost,
            SordCode=@SordCode,
            UnitCost=@UnitCost,
            QuantityOnHand=@QuantityOnHand,
            NameInOtherLanguage=@NameInOtherLanguage,
            ImageId = COALESCE(@ImageId, ImageId),
            IsActive=@IsActive,
            iskitchenPrint=@iskitchenPrint,
            isDiscountAllowed=@isDiscountAllowed,
            IsTaxAllowed=@IsTaxAllowed,
            IsStockDish=@IsStockDish,
            isFOC=@isFOC,
            isServiceCharge=@isServiceCharge,
            isFavourite=@isFavourite,
            isMultiPrice=@isMultiPrice,
            isOpenitem=@isOpenitem
          WHERE DishId=@DishId
        `);

    } else {

      // 🆕 INSERT (ALL COLUMNS)
      await pool.request()
        .input("DishId", sql.UniqueIdentifier, dishId)
        .input("DishCode", sql.VarChar(20), String(newDishCode))
        .input("Name", sql.NVarChar, d.Name || "")
        .input("ShortName", sql.NVarChar, d.ShortName || "")
        .input("Description", sql.NVarChar, d.Description || "")
        .input("DishGroupId", sql.UniqueIdentifier, d.DishGroupId || null)

        .input("CurrentCost", sql.Decimal(18,2), Number(d.CurrentCost) || 0)
        .input("SordCode", sql.Int, Number(d.SordCode) || 0)
        .input("UnitCost", sql.Decimal(18,2), Number(d.UnitCost) || 0)
        .input("QuantityOnHand", sql.Decimal(18,2), Number(d.QuantityOnHand) || 0)

        .input("NameInOtherLanguage", sql.NVarChar, d.NameInOtherLanguage || "")
        .input("ImageId", sql.UniqueIdentifier, imageId)
        .input("IsActive", sql.Bit, Number(d.IsActive) === 1)
        .input("iskitchenPrint", sql.Bit, Number(d.iskitchenPrint) === 1)
        .input("KitchenType", sql.Int, Number(d.KitchenType) || 0)
        .input("SubkitchenType", sql.Int, Number(d.SubkitchenType) || 0)
        .input("isDiscountAllowed", sql.Bit, Number(d.isDiscountAllowed) === 1)
        .input("IsTaxAllowed", sql.Bit, Number(d.IsTaxAllowed) === 1)
        .input("IsStockDish", sql.Bit, Number(d.IsStockDish) === 1)
        .input("isFOC", sql.Bit, Number(d.isFOC) === 1)
        .input("isServiceCharge", sql.Bit, Number(d.isServiceCharge) === 1)
        .input("isFavourite", sql.Bit, Number(d.isFavourite) === 1)
        .input("isMultiPrice", sql.Bit, Number(d.isMultiPrice) === 1)
        .input("isOpenitem", sql.Bit, Number(d.isOpenitem) === 1)

        .query(`
          INSERT INTO DishMaster (
            DishId, DishCode, Name, ShortName, Description,
            DishGroupId, CurrentCost, SordCode, UnitCost, QuantityOnHand,
            NameInOtherLanguage, IsActive, iskitchenPrint,
            isDiscountAllowed, IsTaxAllowed, IsStockDish,
            isFOC, isServiceCharge, isFavourite, isMultiPrice, isOpenitem,
            ImageId, KitchenType, SubkitchenType
          )
          VALUES (
            @DishId, @DishCode, @Name, @ShortName, @Description,
            @DishGroupId, @CurrentCost, @SordCode, @UnitCost, @QuantityOnHand,
            @NameInOtherLanguage, @IsActive, @iskitchenPrint,
            @isDiscountAllowed, @IsTaxAllowed, @IsStockDish,
            @isFOC, @isServiceCharge, @isFavourite, @isMultiPrice, @isOpenitem,
            @ImageId, @KitchenType, @SubkitchenType
          )
        `);
    }

    // 🔥 KITCHEN SAVE
    await pool.request()
      .input("DishId", sql.UniqueIdentifier, dishId)
      .query("DELETE FROM DishKitchenType WHERE DishId=@DishId");

 let kitchens = [];

try {
  kitchens = d.KitchenTypes
    ? JSON.parse(d.KitchenTypes)
    : [];
} catch (e) {
  console.log("Kitchen parse error ❌", d.KitchenTypes);
  kitchens = [];
}
    for (let k of kitchens) {
      await pool.request()
        .input("DishId", sql.UniqueIdentifier, dishId)
        .input("KitchenTypeCode", sql.Int, k.KitchenTypeCode)
         .input("KitchenTypeName", sql.VarChar(100), k.KitchenTypeName)
        .query(`
          INSERT INTO DishKitchenType (DishId, KitchenTypeCode,KitchenTypeName)
          VALUES (@DishId, @KitchenTypeCode,@KitchenTypeName)
        `);
    }

    // 🔥 MODIFIER SAVE
    await pool.request()
      .input("DishId", sql.UniqueIdentifier, dishId)
      .query("DELETE FROM DishModifier WHERE DishId=@DishId");

let mods = [];

try {
  mods = d.Modifiers ? JSON.parse(d.Modifiers) : [];
} catch (e) {
  console.log("Modifier parse error ❌", d.Modifiers);
  mods = [];
}

    for (let m of mods) {
      await pool.request()
        .input("DishId", sql.UniqueIdentifier, dishId)
        .input("ModifierId", sql.UniqueIdentifier, m)
        .query(`
          INSERT INTO DishModifier (DishId, ModifierId)
          VALUES (@DishId, @ModifierId)
        `);
    }

    res.send("Saved ✅");

  } catch (err) {
    console.error("ERROR ❌", err);
    res.status(500).send(err.message);
  }
});

// ================= DELETE =================
app.delete("/dish/:id", async (req, res) => {
  try {
   
    const pool = await poolPromise;

    await pool.request()
      .input("DishId", sql.UniqueIdentifier, req.params.id)
      .query("DELETE FROM DishMaster WHERE DishId=@DishId");

    res.send("Deleted ✅");

  } catch (err) {
    res.status(500).send(err.message);
  }
});

//ADD / REMOVE Modifier(DISH  MODIFIER API)S
app.post("/dishmodifier", async (req, res) => {
  try {
    const { DishId, ModifierId, checked } = req.body;
    const pool = await poolPromise;

    if (checked) {
      // ✅ INSERT
      await pool.request()
        .input("DishId", sql.UniqueIdentifier, DishId)
        .input("ModifierId", sql.UniqueIdentifier, ModifierId)
        .query(`
          INSERT INTO DishModifier
          (DishId, ModifierId)
          VALUES
          (@DishId, @ModifierId)
        `);
    } else {
      // ❌ DELETE
      await pool.request()
        .input("DishId", sql.UniqueIdentifier, DishId)
        .input("ModifierId", sql.UniqueIdentifier, ModifierId)
        .query(`
          DELETE FROM DishModifier
          WHERE DishId=@DishId
          AND ModifierId=@ModifierId
        `);
    }

    res.json({ message: "Dish Modifier updated successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).send("Error");
  }
});
//GET Modifier List (DISH  MODIFIER API)
app.get("/dishmodifier/:id", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("DishId", sql.UniqueIdentifier, req.params.id)
      .query(`
        SELECT ModifierId
        FROM DishModifier
        WHERE DishId=@DishId
      `);

    res.json(result.recordset);

  } catch (err) {
    console.log(err);
    res.status(500).send("Error");
  }
});

//GET Kitchen List (DISH  KITCHEN API)
app.get("/dishkitchen/:id", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("DishId", sql.UniqueIdentifier, req.params.id)
      .query(`
        SELECT KitchenTypeCode
        FROM DishKitchenType
        WHERE DishId=@DishId
      `);

    res.json(result.recordset);

  } catch (err) {
    console.log(err);
    res.status(500).send("Error");
  }
});


//insert dishkitchen

app.post("/dishkitchen", async (req, res) => {
  try {
    const { DishId, KitchenTypeCode, KitchenTypeName, checked } = req.body;

    const pool = await poolPromise; // 🔥 MISSING LINE (IMPORTANT)

    if (checked) {
      await pool.request()
        .input("DishId", sql.UniqueIdentifier, DishId)
        .input("KitchenTypeCode", sql.Int, KitchenTypeCode)
        .input("KitchenTypeName", sql.VarChar(100), KitchenTypeName)
        .query(`
          IF NOT EXISTS (
            SELECT 1 FROM DishKitchenType
            WHERE DishId=@DishId AND KitchenTypeCode=@KitchenTypeCode
          )
          INSERT INTO DishKitchenType
          (DishId, KitchenTypeCode, KitchenTypeName)
          VALUES (@DishId, @KitchenTypeCode, @KitchenTypeName)
        `);

    } else {
      await pool.request()
        .input("DishId", sql.UniqueIdentifier, DishId)
        .input("KitchenTypeCode", sql.Int, KitchenTypeCode)
        .query(`
          DELETE FROM DishKitchenType
          WHERE DishId=@DishId AND KitchenTypeCode=@KitchenTypeCode
        `);
    }

    res.send("OK");

  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});



/*=====================================================end dish
/*==========================GET ALL MODIFIERS*/
app.get("/modifiermaster", async (req, res) => {
  try {
    const pool = await poolPromise;

   const result = await pool.request().query(`
  SELECT 
    ModifierId,
    ModifierCode,
    ModifierName,
    ConflictId,
    isActive,
    SortCode,
    isPriceAffect,
    isDishPrice,
    DishCost,
    isOpenModifier
  FROM ModifierMaster
  ORDER BY 
  CAST(SUBSTRING(ModifierCode, 3, 10) AS INT) DESC
`);

    res.json(result.recordset);

  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/modifiermaster/nextcode", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        'M_' + RIGHT('00000000' + 
          CAST(ISNULL(MAX(CAST(SUBSTRING(ModifierCode, 3, 10) AS INT)), 0) + 1 AS VARCHAR), 
        8) AS NewModifierCode
      FROM ModifierMaster
    `);

    res.json({ code: result.recordset[0].NewModifierCode });

  } catch (err) {
    console.log(err);
    res.status(500).send("Error");
  }
});

//modifier post
app.post("/modifiermaster", async (req, res) => {
  try {
    const {
      ModifierCode,
      ModifierName,
      ConflictId,
      isActive,
      SortCode,
      isPriceAffect,
      isDishPrice,
      DishCost,
      isOpenModifier
    } = req.body;

    if (!ModifierName) {
      return res.status(400).json({ error: "ModifierName is required" });
    }

    const pool = await poolPromise;

//🔥 AUTO GENERATE CODE HERE
const codeResult = await pool.request().query(`
  SELECT 
    'M_' + RIGHT('00000000' + 
      CAST(ISNULL(MAX(CAST(SUBSTRING(ModifierCode, 3, 10) AS INT)), 0) + 1 AS VARCHAR), 
    8) AS NewModifierCode
  FROM ModifierMaster
`);

const newCode = codeResult.recordset[0].NewModifierCode;

const modId = uuidv4();

    await pool.request()
      .input("ModifierId", sql.UniqueIdentifier, modId) 
      .input("ModifierCode", sql.VarChar(50), newCode)
      .input("ModifierName", sql.NVarChar(100), ModifierName || "")
      .input(
        "ConflictId",
        sql.UniqueIdentifier,
        ConflictId && ConflictId !== "" ? ConflictId : null
      )
      .input("isActive", sql.Bit, isActive ?? true)
      .input("SortCode", sql.Int, Number(SortCode) || 0)
      .input("isPriceAffect", sql.Bit, isPriceAffect ?? false)
      .input("isDishPrice", sql.Bit, isDishPrice ?? false)
      .input("DishCost", sql.Decimal(18,2), Number(DishCost) || 0)
      .input("isOpenModifier", sql.Bit, isOpenModifier ?? false)
      .input("CreatedOn", sql.DateTime, new Date())
      .query(`
        INSERT INTO ModifierMaster
        (ModifierId, ModifierCode, ModifierName, ConflictId, isActive, SortCode,
         isPriceAffect, isDishPrice, DishCost, isOpenModifier, CreatedOn)
        VALUES
        (@ModifierId, @ModifierCode, @ModifierName, @ConflictId, @isActive, @SortCode,
         @isPriceAffect, @isDishPrice, @DishCost, @isOpenModifier, @CreatedOn)
      `);

    res.json({ message: "Modifier created", ModifierId: modId });

  } catch (err) {
    console.error("POST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
//put
app.put("/modifiermaster/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const { id } = req.params;

     //  validation
    if (!id) {
      return res.status(400).json({ error: "ModifierId missing" });
    }

    const {
      ModifierCode,
      ModifierName,
      ConflictId,
      isActive,
      SortCode,
      isPriceAffect,
      isDishPrice,
      DishCost,
      isOpenModifier
    } = req.body;

    await pool.request()
    .input("ModifierId", sql.UniqueIdentifier, id)
      .input("ModifierCode", sql.VarChar(50), ModifierCode || "")
      .input("ModifierName", sql.NVarChar(100), ModifierName || "")
      .input(
        "ConflictId",
        sql.UniqueIdentifier,
        ConflictId && ConflictId !== "" ? ConflictId : null
      )
      .input("isActive", sql.Bit, isActive ?? true)
      .input("SortCode", sql.Int, Number(SortCode) || 0)
      .input("isPriceAffect", sql.Bit, isPriceAffect ?? false)
      .input("isDishPrice", sql.Bit, isDishPrice ?? false)
      .input("DishCost", sql.Decimal(18,2), Number(DishCost) || 0)
      .input("isOpenModifier", sql.Bit, isOpenModifier ?? false)
      .input("ModifyOn", sql.DateTime, new Date())
      .query(`
        UPDATE ModifierMaster SET
          ModifierCode=@ModifierCode,
          ModifierName=@ModifierName,
          ConflictId=@ConflictId,
          isActive=@isActive,
          SortCode=@SortCode,
          isPriceAffect=@isPriceAffect,
          isDishPrice=@isDishPrice,
          DishCost=@DishCost,
          isOpenModifier=@isOpenModifier,
          ModifyOn=@ModifyOn
        WHERE ModifierId=@ModifierId
      `);

    res.json({ message: "Modifier updated" });

  } catch (err) {
    console.error("PUT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
//delete
app.delete("/modifiermaster/:id", async (req, res) => {
  try {
    const pool = await poolPromise;

    const check = await pool.request()
      .input("ModifierId", sql.UniqueIdentifier, req.params.id)
      .query(`
        SELECT * FROM CategoryModifier WHERE ModifierId=@ModifierId
        UNION
        SELECT * FROM DishGroupModifier WHERE ModifierId=@ModifierId
        UNION
        SELECT * FROM DishModifier WHERE ModifierId=@ModifierId
      `);

    if (check.recordset.length > 0) {
      return res.status(400).json({
        message: "Modifier is in use. Cannot delete."
      });
    }

    await pool.request()
      .input("ModifierId", sql.UniqueIdentifier, req.params.id)
      .query(`
        DELETE FROM ModifierMaster
        WHERE ModifierId=@ModifierId
      `);

    res.json({ message: "Modifier deleted" });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
//=======================================end modifier
/* ------------------- SERVER ------------------- */
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});