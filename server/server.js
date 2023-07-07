import express from "express";
import morgan from "morgan";
import cors from "cors";
import authroutes from './routes/auth.js';
import {DATABASE_URI} from './config.js';
import mongoose from 'mongoose';
import adroutes from './routes/ad.js'
mongoose.set('strictQuery',false);
mongoose.connect(DATABASE_URI).then(()=>console.log('DB connected')).catch((err)=>console.log('error: ',err));
const app=express();
app.use(express.json({limit:"10mb"}));
app.use(morgan("dev"));
app.use(cors());
app.get("/",(req,res)=>{res.json({message:'HI FROM SERVER'})});
app.use('/api',authroutes);
app.use('/api',adroutes);
app.listen(5000,()=>console.log("server is running on port 5000"));
