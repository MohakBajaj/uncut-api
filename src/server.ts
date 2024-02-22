import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { prisma } from "./lib/db";

dotenv.config();

const app: Express = express();

app.get("/", (req: Request, res: Response) => {
  res.json({message: "Hello Uncut"});
});

export default app;