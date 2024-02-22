import { Request, Response, Router } from "express";
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from "../../lib/utils";
import generateUserHash from "../../lib/hashing";
import {
  checkUserExists,
  createUser,
  saveTokenAndRefreshToken,
  validateGroupAffiliation,
  verifyUserHash,
} from "./authUtils";

const authRouter: Router = Router();

authRouter.get(
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

authRouter.post("/register", async (req: Request, res: Response) => {
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
    const tokens = await saveTokenAndRefreshToken(result.username);
    res.json({
      success: true,
      message: "User created",
      user: result,
      tokens,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while registering user",
    });
  }
});

authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!validatePassword(password) || !validateEmail(email)) {
      return res.json({
        success: false,
        message: "Invalid password or email",
      });
    }
    const userHash = generateUserHash(email, password);
    const userHashVerified = await verifyUserHash(userHash);
    if (userHashVerified === false) {
      return res.json({
        success: false,
        message: "Invalid user hash",
      });
    }
    const tokens = await saveTokenAndRefreshToken(userHashVerified.username);
    res.json({
      success: true,
      message: "User logged in",
      user: userHashVerified,
      tokens,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while logging in user",
    });
  }
});

export default authRouter;
