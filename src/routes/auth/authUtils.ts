import { randomBytes } from "crypto";
import { prisma } from "../../lib/db";
import * as jose from "jose";

export const validateGroupAffiliation = async (groupMail: string) => {
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

export const checkUserExists = async (username: string) => {
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

export const createUser = async (
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

export const verifyUserHash = async (userHash: string) => {
  try {
    const result = await prisma.user.findFirst({
      where: {
        user_hash: userHash,
      },
    });
    if (result === null) {
      return false;
    }
    return result;
  } catch (error) {
    throw new Error("An error occurred while verifying user hash");
  }
};

export const generateToken = async (username: string) => {
  const encoder = new TextEncoder();
  const serverSecret = encoder.encode(
    (process.env.SERVER_SALT as string) || "server_secret"
  );
  const token = await new jose.SignJWT({
    username,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience("Uncut Users")
    .setExpirationTime("2w")
    .setIssuedAt()
    .setIssuer("Uncut")
    .sign(serverSecret);
  return token;
};

export const generateRefreshToken = async () => {
  const refreshToken = randomBytes(64);
  return refreshToken.toString("hex");
};

export const checkIfTokenExistsForUser = async (username: string) => {
  try {
    const result = await prisma.tokens.findFirst({
      where: {
        username: username,
      },
    });
    return result !== null;
  } catch (error) {
    throw new Error(
      "An error occurred while checking if token exists for user"
    );
  }
};

export const saveTokenAndRefreshToken = async (username: string) => {
  if (await checkIfTokenExistsForUser(username)) {
    try {
      // delete the existing token and refresh token
      const result = await prisma.tokens.deleteMany({
        where: {
          username: username,
        },
      });
      if (result === null) {
        throw new Error(
          "An error occurred while deleting token and refresh token"
        );
      }
    } catch (error) {
      throw new Error(
        "An error occurred while deleting token and refresh token"
      );
    }
  }
  const token = await generateToken(username);
  const refreshToken = await generateRefreshToken();
  try {
    const result = await prisma.tokens.create({
      data: {
        token: token,
        refresh_token: refreshToken,
        User: {
          connect: {
            username,
          },
        },
      },
    });
    if (result === null) {
      throw new Error("An error occurred while saving token and refresh token");
    }
    return {
      token,
      refreshToken,
    };
  } catch (error) {
    throw new Error("An error occurred while saving token and refresh token");
  }
};

export const verifyToken = async (token: string) => {
  const encoder = new TextEncoder();
  const serverSecret = encoder.encode(
    (process.env.SERVER_SALT as string) || "server_secret"
  );
  try {
    const result = await jose.jwtVerify(token, serverSecret, {
      audience: "Uncut Users",
      issuer: "Uncut",
      algorithms: ["HS256"],
    });
    return result;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

export const decodeToken = (token: string) => {
  try {
    const result = jose.decodeJwt(token);
    return result;
  } catch (error) {
    throw new Error("Invalid token");
  }
};
