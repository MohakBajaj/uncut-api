import * as crypto from "crypto";

const salt: string = (process.env.SERVER_SALT as string) || "randomSalt123";

export default function generateUserHash(
  email: string,
  password: string
): string {
  // Hash the email and password using SHA3-256
  const hashedEmail = crypto.createHash("sha3-256").update(email).digest();
  const hashedPassword = crypto
    .createHash("sha3-256")
    .update(password)
    .digest();

  // Concatenate hashed email, hashed password, and salt
  const hashedData = Buffer.concat([
    hashedEmail,
    hashedPassword,
    Buffer.from(salt),
  ]);

  // Perform 10 rounds of hashing
  let userHash = crypto.createHash("sha3-256").update(hashedData).digest();
  for (let i = 0; i < 9; i++) {
    userHash = crypto.createHash("sha3-256").update(userHash).digest();
  }

  return userHash.toString("hex");
}
