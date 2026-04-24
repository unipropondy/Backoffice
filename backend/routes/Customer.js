const express = require("express");
const router = express.Router();
const sql = require("mssql");
const poolPromise = require("../db");
const { v4: uuidv4 } = require("uuid");


// ✅ GET ALL CUSTOMERS
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
      FROM CustomerMaster
      ORDER BY Name
    `);

    res.json(result.recordset);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error");
  }
});


// ✅ INSERT / UPDATE CUSTOMER
router.post("/", async (req, res) => {
  try {
    const {
      CustomerId,
      // CustomerCode,
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

    let id = CustomerId || uuidv4();

    let newCode = null; 

    // 🔍 CHECK EXISTS
    const exists = await pool.request()
      .input("CustomerId", sql.UniqueIdentifier, id)
      .query(`
        SELECT * 
        FROM CustomerMaster 
        WHERE CustomerId=@CustomerId
      `);

    if (exists.recordset.length > 0) {

      // ✅ UPDATE
      await pool.request()
        .input("CustomerId", sql.UniqueIdentifier, id)
        .input("Name", sql.VarChar, Name)
        .input("ContactPerson", sql.VarChar, ContactPerson)
        .input("EmailId1", sql.VarChar, EmailId1)
        .input("Address1_Line1", sql.VarChar, Address1_Line1)
        .input("Address1_City", sql.VarChar, Address1_City)
        .input("Address1_PostalCode", sql.VarChar, Address1_PostalCode)
        .input("Address1_Telephone1", sql.VarChar, Address1_Telephone1)
        .input("DOB", sql.SmallDateTime, DOB)
        .input("Anniversary", sql.SmallDateTime, Anniversary)
        .query(`
          UPDATE CustomerMaster
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

    } else {

       const codeResult = await pool.request().query(`
    SELECT 
      'C-' + RIGHT('00000000' + 
        CAST(ISNULL(MAX(CAST(SUBSTRING(CustomerCode, 3, LEN(CustomerCode)) AS INT)), 0) + 1 AS VARCHAR), 
      8) AS NewCustomerCode
    FROM CustomerMaster
  `);

  if (codeResult.recordset.length > 0) {
      newCode = codeResult.recordset[0].NewCustomerCode;
    } else {
      newCode = "C-00000001"; // default
    }

      // ✅ INSERT
      await pool.request()
        .input("CustomerId", sql.UniqueIdentifier, id)
       .input("CustomerCode", sql.VarChar, newCode)
        .input("Name", sql.VarChar, Name)
        .input("ContactPerson", sql.VarChar, ContactPerson)
        .input("EmailId1", sql.VarChar, EmailId1)
        .input("Address1_Line1", sql.VarChar, Address1_Line1)
        .input("Address1_City", sql.VarChar, Address1_City)
        .input("Address1_PostalCode", sql.VarChar, Address1_PostalCode)
        .input("Address1_Telephone1", sql.VarChar, Address1_Telephone1)
        .input("DOB", sql.SmallDateTime, DOB)
        .input("Anniversary", sql.SmallDateTime, Anniversary)
        .input("CreatedBy", sql.UniqueIdentifier, CreatedBy || id)
        .query(`
          INSERT INTO CustomerMaster (
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
  CustomerCode: newCode   // 🔥 ADD THIS
});

  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

module.exports = router;