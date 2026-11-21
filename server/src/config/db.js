import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/packcraft';
    console.log(`[MongoDB]: Connecting to ${uri}...`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`\n❌ [MongoDB Connection Error]: ${error.message}`);
    console.error('👉 Tip: Make sure MongoDB is running. You can start it with:');
    console.error('   brew services start mongodb-community\n');
    process.exit(1);
  }
};
