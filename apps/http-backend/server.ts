import "reflect-metadata";
import dotenv from "dotenv";

import { Application } from "./app";

dotenv.config();

const app = new Application();

app.start(3000);