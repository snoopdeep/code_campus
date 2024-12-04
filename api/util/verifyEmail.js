import dotenv from "dotenv";
dotenv.config();

export const verifyEmail = async (req, res, next) => {
  try {
    console.log("Verifying email middleware");

    const response = await fetch(
      `https://api.mails.so/v1/validate?email=${req.body.email}`,
      {
        method: "GET",
        headers: {
          "x-mails-api-key": process.env.EMAIL_VERIFY,
        },
      }
    );

    const { data, error } = await response.json();

    // Check for API errors first
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Email verification failed",
        error: error,
      });
    }

    // Criteria for a valid email
    const isValidEmail =
      data.result === "deliverable" && // Email is deliverable
      data.isv_format === true && // Valid format
      data.isv_domain === true && // Valid domain
      data.isv_mx === true && // Valid MX records
      data.is_disposable === false && // Not a disposable email
      data.score >= 90; // High confidence score

    if (isValidEmail) {
      // Email is valid, proceed to next middleware
      req.verifiedEmail = data.email;
      next();
    } else {
      // Reject invalid emails
      return res.status(400).json({
        success: false,
        message: "Invalid or unverifiable email",
        details: {
          result: data.result,
          reason: data.reason,
          score: data.score,
        },
      });
    }
  } catch (err) {
    console.error("Email verification error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error during email verification",
      error: err.message,
    });
  }
};
