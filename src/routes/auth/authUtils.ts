import { prisma } from "../../lib/db";

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
