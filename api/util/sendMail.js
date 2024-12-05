// import nodemailer from "nodemailer";

// export const sendMail = async (
//   email,
//   messageType,
//   message,
//   toAdmin = false
// ) => {
//   console.log("hello from sendMail");
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const mailOptions = {
//     from: !toAdmin ? process.env.EMAIL_USER : email,
//     to: !toAdmin ? email : process.env.EMAIL_USER,
//     subject:
//       messageType === "otp"
//         ? "Your OTP for Signup Verification"
//         : "Password Reset Link is:",
//     text: messageType === "otp" ? `Your OTP is: ${message}` : `${message}`,
//   };
//   await transporter.sendMail(mailOptions);
// };

import nodemailer from "nodemailer";

export const sendMail = async (
  email,
  messageType,
  message,
  toAdmin = false
) => {
  console.log("hello from sendMail");

  // Create a transporter using Gmail service
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS, // Your Gmail password or App Password
    },
  });

  // Define the subject based on the message type
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
    default:
      subject = "Notification from CodeCampus";
  }

  // Construct the mail options
  const mailOptions = {
    from: toAdmin ? email : process.env.EMAIL_USER,
    to: toAdmin ? process.env.EMAIL_USER : email,
    subject: subject,
  };

  // Assign content based on the message type
  if (messageType === "otp" || messageType === "password_reset") {
    mailOptions.text =
      messageType === "otp" ? `Your OTP is: ${message}` : `${message}`;
  } else if (messageType === "feedback") {
    mailOptions.html = message; // Use HTML content for feedback
  } else {
    mailOptions.text = message; // Default to plain text
  }

  // Send the email
  console.log(`Sending email from: ${mailOptions.from} to: ${mailOptions.to}`);

  await transporter.sendMail(mailOptions);
};
