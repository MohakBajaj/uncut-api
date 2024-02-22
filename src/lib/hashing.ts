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
  const dataToEncrypt = Buffer.concat([
    hashedEmail,
    hashedPassword,
    Buffer.from(salt),
  ]);

  // Hashing the data again using SHA3-256
  const hashedDataToEncrypt = crypto
    .createHash("sha3-256")
    .update(dataToEncrypt)
    .digest();

  // Generate a random initialization vector (IV)
  const iv = crypto.randomBytes(16);

  // Generate a symmetric key using SHA3g-256 from the salt
  const key = crypto.createHash("sha3-256").update(salt).digest();

  // Create a cipher using AES-256-CBC algorithm
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  // Encrypt the concatenated data
  let encryptedData = Buffer.concat([
    iv,
    cipher.update(hashedDataToEncrypt),
    cipher.final(),
  ]);

  // Encode the encrypted data in base64
  const userHash = encryptedData.toString("base64");

  return userHash;
}
