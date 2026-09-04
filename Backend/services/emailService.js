export const sendVerificationEmail = async ({
  email,
  name,
  verificationUrl,
}) => {
  console.log("\n==============================");
  console.log("EMAIL VERIFICATION");
  console.log("==============================");
  console.log(`To: ${email}`);
  console.log(`Name: ${name}`);
  console.log(`Verification URL: ${verificationUrl}`);
  console.log("==============================\n");
};

export const sendPasswordResetEmail = async ({ email, name, resetUrl }) => {
  console.log("\n==============================");
  console.log("PASSWORD RESET EMAIL");
  console.log("==============================");
  console.log(`To: ${email}`);
  console.log(`Name: ${name}`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log("==============================\n");
};
