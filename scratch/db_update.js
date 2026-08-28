const { poolPromise } = require('../backend/db');

async function main() {
  try {
    const pool = await poolPromise;
    // Check columns
    const result = await pool.request().query(`
      SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME IN ('CategoryMaster', 'DISHGROUPMASTER', 'DISHMASTER') 
      AND COLUMN_NAME IN ('AvailableTimeFrom', 'AvailableTimeTo')
    `);
    console.log("Existing columns:", result.recordset);

    const tables = ['CategoryMaster', 'DISHGROUPMASTER', 'DISHMASTER'];
    
    for (const table of tables) {
      const hasFrom = result.recordset.some(r => r.TABLE_NAME === table && r.COLUMN_NAME === 'AvailableTimeFrom');
      const hasTo = result.recordset.some(r => r.TABLE_NAME === table && r.COLUMN_NAME === 'AvailableTimeTo');

      if (!hasFrom) {
        await pool.request().query(`ALTER TABLE ${table} ADD AvailableTimeFrom VARCHAR(10) NULL`);
        console.log(`Added AvailableTimeFrom to ${table}`);
      }
      if (!hasTo) {
        await pool.request().query(`ALTER TABLE ${table} ADD AvailableTimeTo VARCHAR(10) NULL`);
        console.log(`Added AvailableTimeTo to ${table}`);
      }
    }
    
    console.log("DB update complete.");
  } catch (e) {
    console.error("DB Error:", e);
  } finally {
    process.exit(0);
  }
}

main();
