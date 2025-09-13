import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://admin:kdOwqsCH@127.0.0.1:27017/shikshaguru?authSource=admin';
    
    const conn = await mongoose.connect(mongoURI, {
      // These options are no longer needed in newer versions of mongoose
      // but included for compatibility
    });

    console.log(`🗄️  MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Create geospatial index for location-based search
    await createGeospatialIndexes();
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createGeospatialIndexes = async () => {
  try {
    // Wait for connection to be established
    if (mongoose.connection.db) {
      await mongoose.connection.db.collection('teachers').createIndex({
        "location.coordinates": "2dsphere"
      });
      
      await mongoose.connection.db.collection('jobs').createIndex({
        "location.coordinates": "2dsphere"
      });
      
      console.log('🗺️  Geospatial indexes created successfully');
    }
  } catch (error) {
    console.log('📍 Geospatial indexes already exist or will be created when collections are populated');
  }
};

export default connectDB;