const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

let mongoServer;

const connectDB = async () => {
  try {
    const connURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vizo_tech';
    
    if (connURI.includes('127.0.0.1') || connURI.includes('localhost')) {
      try {
        console.log('Checking for existing local MongoDB instance...');
        await mongoose.connect(connURI, { serverSelectionTimeoutMS: 2000 });
        console.log('MongoDB Connected successfully to existing instance');
        return;
      } catch (err) {
        console.log('Local MongoDB not detected. Starting in-memory MongoDB server on a random free port...');
        
        try {
          mongoServer = await MongoMemoryServer.create({
            instance: {
              dbName: 'vizo_tech'
            }
          });
          const serverUri = mongoServer.getUri();
          console.log(`In-memory MongoDB Server active at: ${serverUri}`);
          
          await mongoose.disconnect();
          await mongoose.connect(serverUri);
          console.log('MongoDB Connected successfully to in-memory instance');
          return;
        } catch (memErr) {
          console.error(`Failed to start in-memory MongoDB server: ${memErr.message}`);
          throw memErr;
        }
      }
    }

    console.log(`Connecting to MongoDB at: ${connURI}`);
    await mongoose.connect(connURI);
    console.log('MongoDB Connected successfully');
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
