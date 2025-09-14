const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://admin:JtlsfYlv@127.0.0.1:27017/shikshaguru?authSource=admin')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Get the User collection
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();
    
    console.log('Users in database:');
    users.forEach(user => {
      console.log('- Email:', user.email);
      console.log('- Role:', user.role);
      console.log('- Password exists:', !!user.password);
      console.log('- Profile:', user.profile);
      console.log('---');
    });
    
    // Try to check password for test@test.com
    const testUser = users.find(u => u.email === 'test@test.com');
    if (testUser && testUser.password) {
      const isMatch = await bcrypt.compare('admin123', testUser.password);
      console.log('Password match for admin123:', isMatch);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });