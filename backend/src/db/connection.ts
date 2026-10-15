import mongoose from 'mongoose';

let isConnected = false;
let currentUri = '';
let currentDatabase = '';

export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jarvisos';
  const dbName = process.env.MONGODB_DATABASE || 'jarvisos';
  currentUri = uri;
  currentDatabase = dbName;

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    const sanitizedUri = uri.replace(/\/\/.*@/, '//***@');
    console.log(`\x1b[32m[MongoDB]\x1b[0m Connected successfully to: ${sanitizedUri} (Database: ${dbName})`);
    return true;
  } catch (err: any) {
    isConnected = false;
    console.warn(`\x1b[33m[MongoDB Warning]\x1b[0m Unable to connect to MongoDB: ${err.message}`);
    console.warn('\x1b[33m[MongoDB Warning]\x1b[0m Operating with local disk fallback (data/tasks.json & data/reports/).');
    return false;
  }
}

export function isMongoConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export function getMongoStatus(): { connected: boolean; state: string; uri: string; database: string } {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const stateStr = states[mongoose.connection.readyState] || 'disconnected';
  return {
    connected: isMongoConnected(),
    state: stateStr,
    uri: currentUri ? currentUri.replace(/\/\/.*@/, '//***@') : '',
    database: currentDatabase || process.env.MONGODB_DATABASE || 'jarvisos',
  };
}
