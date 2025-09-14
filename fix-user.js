const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://admin:JtlsfYlv@127.0.0.1:27017/shikshaguru?authSource=admin')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Get the User collection
    const db = mongoose.connection.db;
    
    // Delete the incomplete user
    const result = await db.collection('users').deleteOne({ email: 'test@test.com' });
    console.log('Deleted users:', result.deletedCount);
    
    console.log('User deleted successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });