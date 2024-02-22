import { Request, Response, Router } from "express";
import { prisma } from "../lib/db";
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from "../lib/utils";
import generateUserHash from "../lib/hashing";

const registerRoute = Router();

const validateGroupAffiliation = async (groupMail: string) => {
  const groupIdentifier = groupMail.split("@")[1];
  const result = await prisma.groups.findFirst({
    where: {
      group_identifier: groupIdentifier,
    },
  });
  if (result === null) {
    return {
      success: false,
      message: "Group not found",
    };
  }
  return {
    success: true,
    message: "Group found",
  };
};

registerRoute.post("/", async (req: Request, res: Response) => {
  const { email, password, username } = req.body;
  if (
    !validateEmail(email) ||
    !validatePassword(password) ||
    !validateUsername(username)
  ) {
    return res.json({
      success: false,
      message: "Invalid email, password, or username",
    });
  }
  const userHash = generateUserHash(email, password);
  const result = await prisma.user.create({
    data: {
      username: username,
      user_hash: userHash,
      group: {
        connect: {
          group_identifier: email.split("@")[1],
        },
      },
    },
  });
  res.json({
    success: true,
    message: "User created",
    user: result,
  });
});

registerRoute.get(
  "/validateGroupAffiliation/:email",
  async (req: Request, res: Response) => {
    const email = req.params.email;
    if (!validateEmail(email)) {
      return res.json({
        success: false,
        message: "Invalid email",
      });
    }
    const result = await validateGroupAffiliation(email);
    res.json(result);
  }
);

export default registerRoute;
