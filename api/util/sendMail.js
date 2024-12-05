import nodemailer from "nodemailer";

export const sendMail = async (email, messageType, message) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject:
      messageType === "otp"
        ? "Your OTP for Signup Verification"
        : "Password Reset Link is:",
    text: messageType === "otp" ? `Your OTP is: ${message}` : `${message}`,
  };
  await transporter.sendMail(mailOptions);
};
