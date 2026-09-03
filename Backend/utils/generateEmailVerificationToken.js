import crypto from "crypto";

export const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString("hex");
};
