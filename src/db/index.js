import mongoose from 'mongoose';
import { DB_NAME } from '../constant.js';

const dbConnection = async () => {
  try {
    const connectionInstence = await mongoose.connect(
      `${process.env.MONGO_URL}/${DB_NAME}`,
    );
    console.log(
      `\n MongoDB Connected !! DB_HOST: ${connectionInstence.connection.host}`,
    );
  } catch (error) {
    console.log('MONGODB CONNECTION ERROR', error);
    process.exit(1);
  }
};

export default dbConnection;
