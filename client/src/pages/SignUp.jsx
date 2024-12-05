import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../components/OAuth";

export default function SignUp() {
  // State to manage form data
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
  });

  // State to manage OTP input
  const [otp, setOtp] = React.useState("");

  // State to toggle between signup form and OTP verification
  const [isOtpSent, setIsOtpSent] = React.useState(false);

  // State to manage messages and loading state
  const [errorMessage, setErrorMessage] = React.useState(null);
  const [successMessage, setSuccessMessage] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const [verifiedEmail, setVerifiedEmail] = React.useState("");

  const navigate = useNavigate();

  // Handle input changes for signup form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  // Handle input changes for OTP field
  const handleOtpChange = (e) => {
    setOtp(e.target.value.trim());
  };

  // Reset form data and error messages when error occurs
  useEffect(() => {
    if (errorMessage) {
      setFormData({
        name: "",
        email: "",
        password: "",
      });
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 7000);
      return () => clearTimeout(timer);
    }

    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  // Handle Signup Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate form inputs
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      formData.name === " " ||
      formData.email === " " ||
      formData.password === " "
    ) {
      return setErrorMessage("Please fill all the fields");
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const res = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        setFormData({
          name: "",
          email: "",
          password: "",
        });
        return setErrorMessage(data.message || "Signup failed");
      }

      // If signup is successful, prompt for OTP
      if (res.ok) {
        setLoading(false);
        setSuccessMessage(
          "Signup successful! An OTP has been sent to your email, please enter the otp for varification."
        );
        setIsOtpSent(true);
        setVerifiedEmail(formData.email); // Store email separately
      }
    } catch (err) {
      setLoading(false);
      setFormData({
        name: "",
        email: "",
        password: "",
      });
      console.error(err);
      return setErrorMessage(err.message || "An unexpected error occurred");
    }
  };

  // Handle OTP Verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    // Validate OTP input
    if (!otp || otp.trim() === "") {
      return setErrorMessage("Please enter the OTP");
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const res = await fetch("http://localhost:3000/api/auth/verifyOTP", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: verifiedEmail, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        return setErrorMessage(data.message || "OTP verification failed");
      }

      // If OTP verification is successful, redirect to sign-in page
      if (res.ok) {
        setLoading(false);
        setSuccessMessage(
          "Email verified successfully! Redirecting to login page..."
        );
        setTimeout(() => {
          navigate("/sign-in");
        }, 5000);
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      return setErrorMessage(err.message || "An unexpected error occurred");
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const res = await fetch("http://localhost:3000/api/auth/resendOTP", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: verifiedEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        return setErrorMessage(data.message || "Failed to resend OTP");
      }

      if (res.ok) {
        setLoading(false);
        setSuccessMessage("OTP has been resent to your email.");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      return setErrorMessage(err.message || "An unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen mt-20">
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
        {/* Left Side */}
        <div className="flex-1">
          <Link to={"/"} className="font-bold dark:text-white text-4xl">
            <span className="px-2 py-1 bg-gradient-to-r from-orange-500 via-white-500 to-green-500 rounded-lg text-white">
              code
            </span>
            Campus
          </Link>
          <p className="text-sm mt-5">
            This is a demo project. You can sign up to access the dashboard.
          </p>
        </div>

        {/* Right Side */}
        <div className="flex-1">
          {!isOtpSent ? (
            // Signup Form
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="name" value="Your Username" />
                <TextInput
                  type="text"
                  placeholder="Username"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" value="Your Email" />
                <TextInput
                  type="email"
                  placeholder="name@company.com"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" value="Your Password" />
                <TextInput
                  type="password"
                  placeholder="Password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button
                gradientDuoTone={"purpleToPink"}
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    <span className="pl-3">Loading...</span>
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
              <OAuth />
            </form>
          ) : (
            // OTP Verification Form
            <form className="flex flex-col gap-4" onSubmit={handleVerifyOtp}>
              <div>
                <Label htmlFor="otp" value="Enter OTP" />
                <TextInput
                  type="text"
                  placeholder="123456"
                  id="otp"
                  value={otp}
                  onChange={handleOtpChange}
                  required
                />
              </div>
              <Button
                gradientDuoTone={"greenToBlue"}
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    <span className="pl-3">Verifying...</span>
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>
              <Button
                color="gray"
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    <span className="pl-3">Resending...</span>
                  </>
                ) : (
                  "Resend OTP"
                )}
              </Button>
            </form>
          )}

          {/* Link to Sign In */}
          <div className="flex gap-2 text-sm mt-5">
            <span>Already have an account?</span>
            <Link to={"/sign-in"} className="text-blue-500">
              Sign In
            </Link>
          </div>
          <div className="flex gap-2 text-sm mt-5">
            <span> Forgot Password:</span>
            <Link to={"/forgot-password"} className="text-blue-500">
              Reset Password
            </Link>
          </div>

          {/* Display Error Message */}
          {errorMessage && (
            <Alert className="mt-5" color={"failure"}>
              {errorMessage}
            </Alert>
          )}

          {/* Display Success Message */}
          {successMessage && (
            <Alert className="mt-5" color={"success"}>
              {successMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
