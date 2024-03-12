import mongoose from 'mongoose';
const dbUrl = process.env.DB_URL;

 const dbConnect = async () => {
    try {
       const connectionInstance= await mongoose.connect(dbUrl);
        console.log('Connected to database on url ', dbUrl);
    } catch (error) {
        console.log('Error connecting to database', error);
    }
}

export default dbConnect;