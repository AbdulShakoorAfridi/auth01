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
