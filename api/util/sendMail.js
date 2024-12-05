import nodemailer from "nodemailer";

export const sendMail = async (
  email,
  messageType,
  message,
  toAdmin = false
) => {
  console.log("hello from sendMail");

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
      subject="Thank You for Your Donation!"  
    default:
      subject = "Notification from CodeCampus";
  }

  const mailOptions = {
    from: toAdmin ? email : process.env.EMAIL_USER,
    to: toAdmin ? process.env.EMAIL_USER : email,
    subject: subject,
  };

  if (messageType === "otp" || messageType === "password_reset") {
    mailOptions.text =
      messageType === "otp" ? `Your OTP is: ${message}` : `${message}`;
  } else if (messageType === "feedback"||messageType==="paymentSuccess") {
    mailOptions.html = message; // Use HTML content for feedback
  } else {
    mailOptions.text = message; // Default to plain text
  }

  // Send the email
  console.log(`Sending email from: ${mailOptions.from} to: ${mailOptions.to}`);
  await transporter.sendMail(mailOptions);
};
