import express from 'express';
const app = express();
import authRoutes from './routes/auth.js';
import cors from "cors";


//middleware
app.use(express.json());
app.use(cors());

//user route
app.use("/api", authRoutes);




// module.exports = app;
export default app;