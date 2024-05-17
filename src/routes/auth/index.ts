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
  verifyRefreshToken,
  verifyToken,
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

authRouter.get("/verifyToken", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization;
    // console.log(token);
    if (!token) {
      return res.json({
        success: false,
        message: "Invalid token",
      });
    }
    const verified = await verifyToken(token);
    res.json({
      success: true,
      tokenData: verified,
      message: verified ? "Token verified" : "Token not verified",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while verifying token",
    });
  }
});

authRouter.get("/refreshToken", async (req: Request, res: Response) => {
  try {
    const token = req.headers.token as string;
    const refreshToken = req.headers.refreshtoken as string;
    if (!token || !refreshToken) {
      return res.json({
        success: false,
        message: "Invalid token or refresh token",
      });
    }
    const verified = await verifyToken(token);
    if (verified === null) {
      return res.json({
        success: false,
        message: "Invalid token",
      });
    }
    const verifiedRefreshToken = await verifyRefreshToken(refreshToken);
    if (verifiedRefreshToken === false) {
      return res.json({
        success: false,
        message: "Invalid refresh token",
      });
    }
    const result = await saveTokenAndRefreshToken(
      verified.payload.username as string
    );
    res.json({
      success: true,
      message: "Token refreshed",
      tokens: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while refreshing token",
    });
  }
});

export default authRouter;
