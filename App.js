const express=require('express');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const userRoutes= require("./routes/userRoutes")
const app= express();
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const PORT=3001 || 6001;
app.use(express.json());
app.use(express.urlencoded({extended: false}))


app.use(userRoutes);
 

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URL).then(()=>{
        app.listen(PORT, ()=> console.log(`SERVER PORT: ${PORT}`));   
     })
     .catch((error)=> console.log(`${error} did not connect`));
    




 