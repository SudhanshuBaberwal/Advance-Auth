import mongoose from "mongoose";

export const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`Mongodb Connected : ${conn.connection.host}`)
    }
    catch(error){
        console.log("Error connection to MongoDB : " , error.message)
        process.exit(1)  // 1 is failer and 0 is success
    }
}