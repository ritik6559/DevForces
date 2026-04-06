import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';

dotenv.config();

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8001;

server.listen(PORT, () => {
  console.log(`Runner service is running on port ${PORT}`);
});