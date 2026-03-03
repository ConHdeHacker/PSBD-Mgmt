import Database from 'better-sqlite3';
import fs from 'fs';

const DB_PATH = 'psbd.db';

if (fs.existsSync(DB_PATH)) {
  const db = new Database(DB_PATH);
  const tables = [
    'opportunities', 'opportunity_profiles', 'opportunity_tools', 
    'opportunity_hours_logs', 'documents', 'positions', 'candidates', 
    'staff', 'staff_annual', 'vacations', 'clients', 'projects', 'work_hours'
  ];

  try {
    db.exec('PRAGMA foreign_keys = OFF');
    tables.forEach(table => {
      db.prepare(`DELETE FROM ${table}`).run();
      // Reset autoincrement
      db.prepare(`DELETE FROM sqlite_sequence WHERE name = ?`).run(table);
    });
    db.exec('PRAGMA foreign_keys = ON');
    console.log('Database cleared successfully.');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    db.close();
  }
} else {
  console.log('Database file not found.');
}
