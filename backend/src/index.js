import dotenv from 'dotenv';
import { app } from './app.js';
import { connectDB } from './db/index.js';

const port = process.env.PORT || 3000

dotenv.config({path:'./.env'});

connectDB()
.then(()=> {
  app.listen(port, ()=> {
    console.log(`Server is listening at port: ${port}`);
  })
})