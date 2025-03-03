import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import farmerInputs from './routes/farmerInputs.route.js';

const app = express();
dotenv.config();
dotenv.config({ path: '../.env' });

const PORT = process.env.PORT;

app.use(express.json());
app.use('/', farmerInputs);

app.listen(PORT, () => {
    connectDB();
    console.log('Server is running on port ' + PORT);
});


