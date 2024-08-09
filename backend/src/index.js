import dotenv from 'dotenv';
import { app } from './app.js';

const port = process.env.PORT || 3000

dotenv.config({path:'./.env'});

app.get('/',(req,res)=> {
  
})

app.listen(port,()=>{
  console.log(`Server listening at port ${port}`);
})