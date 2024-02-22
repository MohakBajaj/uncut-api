import { Request, Response, Router } from "express";
import { prisma } from "../lib/db";
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from "../lib/utils";
import generateUserHash from "../lib/hashing";

const validateGroupAffiliation = async (groupMail: string) => {
  try {
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
  } catch (error) {
    return {
      success: false,
      message: "An error occurred while validating group affiliation",
    };
  }
};

const checkUserExists = async (username: string) => {
  try {
    const result = await prisma.user.findFirst({
      where: {
        username: username,
      },
    });
    return result !== null;
  } catch (error) {
    throw new Error("An error occurred while checking user existence");
  }
};

const createUser = async (
  username: string,
  userHash: string,
  groupIdentifier: string
) => {
  try {
    const result = await prisma.user.create({
      data: {
        username: username,
        user_hash: userHash,
        group: {
          connect: {
            group_identifier: groupIdentifier,
          },
        },
      },
    });
    return result;
  } catch (error) {
    throw new Error("An error occurred while creating user");
  }
};

const registerRoute = Router();

registerRoute.post("/", async (req: Request, res: Response) => {
  try {
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
    const userExists = await checkUserExists(username);
    if (userExists) {
      return res.json({
        success: false,
        message: "User already exists",
      });
    }
    const result = await createUser(username, userHash, email.split("@")[1]);
    res.json({
      success: true,
      message: "User created",
      user: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while registering user",
    });
  }
});

registerRoute.get(
  "/validateGroupAffiliation/:email",
  async (req: Request, res: Response) => {
    try {
      const email = req.params.email;
      if (!validateEmail(email)) {
        return res.json({
          success: false,
          message: "Invalid email",
        });
      }
      const result = await validateGroupAffiliation(email);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred while validating group affiliation",
      });
    }
  }
);

export default registerRoute;
