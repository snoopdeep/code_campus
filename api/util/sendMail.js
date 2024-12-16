import nodemailer from "nodemailer";

export const sendMail = async (
  email,
  messageType,
  message,
  toAdmin = false
) => {
  console.log("hello from sendMail", email);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let subject;
  switch (messageType) {
    case "otp":
      subject = "Your OTP for Signup Verification";
      break;
    case "feedback":
      subject = "New Feedback Submitted on CodeCampus";
      break;
    case "password_reset":
      subject = "Password Reset Link";
      break;
    case "paymentSuccess":
      subject = "Thank You for Your Donation!";
      break;
    case "userPostVerification":
      subject = "Post Under Verification";
      break;
    case "postVerificationConfirmed":
      subject = "Congrats!!Post Verification Confirmed";
      break;
    case "otpSignUp":
      subject = "Your OTP for Signup Verification";
      break;
    case "password_reset":
      subject = "Password Reset Request for Your AceConnect Account";
      break;
    case "otpUpdate":
      subject = "AceConnect: Account Update Confirmation & OTP";
      break;
    default:
      subject = "Notification from CodeCampus";
  }

  const mailOptions = {
    from: toAdmin ? email : process.env.EMAIL_USER,
    to: toAdmin ? process.env.EMAIL_USER : email,
    subject: subject,
  };

  if (messageType === "otp") {
    mailOptions.text =
      messageType === "otp" ? `Your OTP is: ${message}` : `${message}`;
  } else if (
    messageType === "feedback" ||
    messageType === "paymentSuccess" ||
    messageType === "userPostVerification" ||
    messageType === "postVerificationConfirmed" ||
    messageType === "otpSignUp" ||
    messageType === "password_reset" ||
    messageType === "otpUpdate"
  ) {
    mailOptions.html = message; // Use HTML content for feedback
  } else {
    mailOptions.text = message; // Default to plain text
  }

  // Send the email
  console.log(`Sending email from: ${mailOptions.from} to: ${mailOptions.to}`);
  await transporter.sendMail(mailOptions);
};
