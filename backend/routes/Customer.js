const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db");
const { v4: uuidv4 } = require("uuid");


// ================= GET =================
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
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
    console.log("GET ERROR ❌", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= GET NEW CODE =================
router.get("/newcode", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        'C-' + RIGHT('00000000' + 
        CAST(ISNULL(MAX(CAST(SUBSTRING(CustomerCode, 3, LEN(CustomerCode)) AS INT)), 0) + 1 AS VARCHAR), 
        8) AS NewCustomerCode
      FROM dbo.CustomerMaster
    `);

    res.json({ code: result.recordset[0].NewCustomerCode });

  } catch (err) {
    console.log("NEW CODE ERROR ❌", err);
    res.status(500).json({ error: err.message });
  }
});


// ================= GET BY ID =================
router.get("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;

    const paramId = req.params.id;

    console.log("API HIT ID 👉", paramId);

    // 🔥 THIS LINE FIXES YOUR ERROR
    if (!paramId || paramId === "undefined") {
      return res.status(400).json({ error: "Invalid CustomerId" });
    }

    const result = await pool.request()
      .input("CustomerId", sql.UniqueIdentifier, paramId)
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

    res.json(result.recordset[0]);

  } catch (err) {
    console.log("GET BY ID ERROR ❌", err);
    res.status(500).json({ error: err.message });
  }
});


// ================= INSERT / UPDATE =================
router.post("/", async (req, res) => {
  try {
    const {
      CustomerId,
      Name,
      ContactPerson,
      EmailId1,
      Address1_Line1,
      Address1_City,
      Address1_PostalCode,
      Address1_Telephone1,
      DOB,
      Anniversary,
      CreatedBy
    } = req.body;

    const pool = await poolPromise;

const isValidGuid = (val) => {
  if (!val) return false;   // 🔥 MOST IMPORTANT LINE

  return typeof val === "string" &&
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val.trim());
};

let id;

if (CustomerId && CustomerId !== "") {
  id = CustomerId;
} else {
  id = uuidv4();   // 🔥 NEW ID
}

let createdByValue;

if (CreatedBy && CreatedBy !== "") {
  createdByValue = CreatedBy;
} else {
  createdByValue = "00000000-0000-0000-0000-000000000001";
}

    // 🔥 ADD HERE
console.log("CustomerId 👉", CustomerId);
console.log("Final ID 👉", id);
console.log("CreatedBy 👉", CreatedBy);
console.log("Final CreatedBy 👉", createdByValue);

    // ✅ SAFE DATE
    const dobValue = DOB && DOB !== "" ? new Date(DOB) : null;
    const annValue = Anniversary && Anniversary !== "" ? new Date(Anniversary) : null;

    let newCode = null;

    // ================= CHECK EXISTS =================
   let exists;

if (CustomerId && CustomerId !== "") {
  // 🔵 EDIT MODE
  exists = await pool.request()
    .input("CustomerId", sql.UniqueIdentifier, CustomerId)
    .query(`
      SELECT CustomerId 
      FROM dbo.CustomerMaster
      WHERE CustomerId = @CustomerId
    `);
} else {
  // 🟢 NEW MODE (IMPORTANT FIX)
  exists = { recordset: [] };   // 🔥 SKIP SQL CALL
}

    if (exists.recordset.length > 0) {

      // ================= UPDATE =================
      await pool.request()
        .input("CustomerId", sql.UniqueIdentifier, id)
        .input("Name", sql.VarChar, Name || "")
        .input("ContactPerson", sql.VarChar, ContactPerson || "")
        .input("EmailId1", sql.VarChar, EmailId1 || "")
        .input("Address1_Line1", sql.VarChar, Address1_Line1 || "")
        .input("Address1_City", sql.VarChar, Address1_City || "")
        .input("Address1_PostalCode", sql.VarChar, Address1_PostalCode || "")
        .input("Address1_Telephone1", sql.VarChar, Address1_Telephone1 || "")
        .input("DOB", sql.SmallDateTime, dobValue)
        .input("Anniversary", sql.SmallDateTime, annValue)
        .query(`
          UPDATE dbo.CustomerMaster
          SET 
            Name = @Name,
            ContactPerson = @ContactPerson,
            EmailId1 = @EmailId1,
            Address1_Line1 = @Address1_Line1,
            Address1_City = @Address1_City,
            Address1_PostalCode = @Address1_PostalCode,
            Address1_Telephone1 = @Address1_Telephone1,
            DOB = @DOB,
            Anniversary = @Anniversary,
            ModifiedOn = GETDATE()
          WHERE CustomerId = @CustomerId
        `);

      // ✅ GET EXISTING CODE
      const codeRes = await pool.request()
        .input("CustomerId", sql.UniqueIdentifier, id)
        .query(`
          SELECT CustomerCode 
          FROM dbo.CustomerMaster
          WHERE CustomerId = @CustomerId
        `);

      newCode = codeRes.recordset[0]?.CustomerCode || null;

    } else {

      // ================= GENERATE CODE =================
      const codeResult = await pool.request().query(`
        SELECT 
          'C-' + RIGHT('00000000' + 
          CAST(ISNULL(MAX(CAST(SUBSTRING(CustomerCode, 3, LEN(CustomerCode)) AS INT)), 0) + 1 AS VARCHAR), 
          8) AS NewCustomerCode
        FROM dbo.CustomerMaster
      `);

      newCode = codeResult.recordset[0]?.NewCustomerCode || "C-00000001";

      // 🔥 FINAL CHECK (ADD HERE)
console.log("🔥 FINAL CHECK");
console.log("CustomerId 👉", id);
console.log("CreatedBy 👉", createdByValue);
console.log("TYPE ID 👉", typeof id);
console.log("TYPE CreatedBy 👉", typeof createdByValue);

      // ================= INSERT =================
      await pool.request()
        .input("CustomerId", sql.UniqueIdentifier, id)
        .input("CustomerCode", sql.VarChar, newCode)
        .input("Name", sql.VarChar, Name || "")
        .input("ContactPerson", sql.VarChar, ContactPerson || "")
        .input("EmailId1", sql.VarChar, EmailId1 || "")
        .input("Address1_Line1", sql.VarChar, Address1_Line1 || "")
        .input("Address1_City", sql.VarChar, Address1_City || "")
        .input("Address1_PostalCode", sql.VarChar, Address1_PostalCode || "")
        .input("Address1_Telephone1", sql.VarChar, Address1_Telephone1 || "")
        .input("DOB", sql.SmallDateTime, dobValue)
        .input("Anniversary", sql.SmallDateTime, annValue)
        .input("CreatedBy", sql.UniqueIdentifier, createdByValue)
        .query(`
          INSERT INTO dbo.CustomerMaster (
            CustomerId,
            CustomerCode,
            Name,
            ContactPerson,
            EmailId1,
            Address1_Line1,
            Address1_City,
            Address1_PostalCode,
            Address1_Telephone1,
            DOB,
            Anniversary,
            CreatedBy,
            CreatedOn
          )
          VALUES (
            @CustomerId,
            @CustomerCode,
            @Name,
            @ContactPerson,
            @EmailId1,
            @Address1_Line1,
            @Address1_City,
            @Address1_PostalCode,
            @Address1_Telephone1,
            @DOB,
            @Anniversary,
            @CreatedBy,
            GETDATE()
          )
        `);
    }

    res.json({
      message: "Saved Successfully",
      CustomerId: id,
      CustomerCode: newCode
    });

  } catch (err) {
    console.log("POST ERROR ❌", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;