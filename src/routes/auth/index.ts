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
  validateGroupAffiliation,
} from "./authUtils";

const authRouter: Router = Router();

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

export default authRouter;
