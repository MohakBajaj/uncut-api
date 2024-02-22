import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { prisma } from "./lib/db";
import registerRoute from "./routes/register";

dotenv.config();

const app: Express = express();

app.use(express.json());

app.use("/register", registerRoute);

app.get("/", async (req: Request, res: Response) => {
  res.json({
    0: await prisma.groups.findMany(),
    1: await prisma.user.findMany(),
    2: await prisma.admins.findMany(),
  });
});

export default app;
