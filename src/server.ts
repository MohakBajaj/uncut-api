import express, { Express, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { prisma } from "./lib/db";
import authRouter from "./routes/auth";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";

dotenv.config();

const app: Express = express();

app.use(compression());
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    optionsSuccessStatus: 200,
  })
);
app.use(helmet());
app.disable("x-powered-by");

app.use((req: Request, res: Response, next: NextFunction) => {
  const serverIdentity = process.env.SERVER_CONNECTION_SECRET;

  if (req.headers["x-server-identity"] !== serverIdentity) {
    return res
      .status(401)
      .json({
        message:
          "Unauthorized! You are not allowed to send requests to this server",
      });
  }

  next();
});

app.use("/auth", authRouter);

app.get("/", async (req: Request, res: Response) => {
  res.json({
    0: await prisma.groups.findMany(),
    1: await prisma.user.findMany(),
    2: await prisma.admins.findMany(),
  });
});

export default app;
