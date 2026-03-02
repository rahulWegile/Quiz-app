import express from 'express'
import query from "./database/db.js"
import authRoutes from'./routes/auth.route.js'
import userRoutes from'./routes/user.route.js'
import dotenv from 'dotenv';
dotenv.config();
const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//auth routes
app.use('/api',authRoutes)
app.use('/api',userRoutes)


//db connection 
const connect= async ()=>{


    const result = await query(`SELECT version()`)
    console.log(result.rows[0].version);
    
    const PORT = process.env.PORT || 5000
    app.listen(PORT,()=>{
        console.log(`app running on port:${PORT}`);
    })
}

connect()