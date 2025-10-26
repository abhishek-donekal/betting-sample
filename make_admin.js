const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/betting.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Update admin user role
db.run('UPDATE users SET role = ? WHERE username = ?', ['admin', 'admin'], function(err) {
  if (err) {
    console.error('Error updating admin role:', err.message);
  } else {
    console.log('✅ Admin role updated successfully!');
    console.log('Changes:', this.changes);
  }
  
  // Verify the update
  db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
    if (err) {
      console.error('Error querying admin user:', err.message);
    } else if (row) {
      console.log('✅ Admin user verified:');
      console.log('ID:', row.id);
      console.log('Username:', row.username);
      console.log('Email:', row.email);
      console.log('Role:', row.role);
      console.log('Credits:', row.credits);
    } else {
      console.log('❌ Admin user not found');
    }
    db.close();
  });
});
