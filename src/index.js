import dotenv from 'dotenv';
// const dotenv = require('.dotenv').config({ path: './env' });
import dbConnection from './db/index.js';
import app from './app.js';

dotenv.config({
  path: './env',
});

dbConnection()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log('MONGODB connection failed!!');
  });
