import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../components/OAuth";
import { BiShow,BiHide } from "react-icons/bi";


export default function SignUp() {
  // State to manage form data
  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    // USN: "",
  });

  // State to manage OTP input
  const [otp, setOtp] = useState("");

  // State to toggle between signup form and OTP verification
  const [isOtpSent, setIsOtpSent] = useState(false);

  // State to manage messages and loading state
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  // Handle input changes for signup form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Handle input changes for OTP field
  const handleOtpChange = (e) => {
    setOtp(e.target.value.trim());
  };

  // Reset form data and error messages when error occurs
  useEffect(() => {
    if (errorMessage) {
      setFormData({
        userName: "",
        fullName: "",
        email: "",
        // USN: "",
        password: "",
        confirmPassword: "",
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

  // check password compitability
  function checkPassword(str) {
    var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(str);
  }
  // Handle Signup Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate form inputs
    if (
      !formData.userName ||
      !formData.fullName ||
      !formData.email ||
      // !formData.USN ||
      !formData.password ||
      !formData.confirmPassword ||
      formData.userName === " " ||
      formData.fullName === " " ||
      formData.email === " " ||
      // formData.USN === " " ||
      formData.password === " " ||
      formData.confirmPassword === " "
    ) {
      return setErrorMessage("Please fill all the fields");
    }

    if (!checkPassword(formData.password)) {
      return setErrorMessage(
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character."
      );
    }
    if (formData.password !== formData.confirmPassword) {
      return setErrorMessage("passwords does not matched.");
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
          userName: "",
          email: "",
          password: "",
          fullName: "",
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
        userName: "",
        email: "",
        password: "",
        fullName: "",
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
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  return (
    <div className="min-h-screen mt-20">
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
        {/* Left Side */}
        <div className="flex-1">
          <Link to={"#"} className="font-bold dark:text-white text-4xl">
            <img src="/user (1).png"></img>
            <span className="px-0 py-1 rounded-lg text-text-gray-700 dark:white">
              ace
            </span>
            <span className="text-blue-500">Connect</span>
          </Link>
          {!isOtpSent && (
            <p className="text-sm mt-5">
              Password must be at least{" "}
              <span className="font-semibold">8 characters</span> long and
              include at least:
              <ul className="list-inside list-disc mt-2 text-sm">
                <li className="text-gray-700 dark:text-gray-200">
                  One <span className="font-semibold">uppercase letter</span>
                </li>
                <li className="text-gray-700 dark:text-gray-200">
                  One <span className="font-semibold">lowercase letter</span>
                </li>
                <li className="text-gray-700 dark:text-gray-200">
                  One <span className="font-semibold">digit</span>
                </li>
                <li className="text-gray-700 dark:text-gray-200">
                  One <span className="font-semibold">special character</span>
                </li>
              </ul>
            </p>
          )}
        </div>

        {/* Right Side */}
        <div className="flex-1">
          {!isOtpSent ? (
            // Signup Form
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div>
                {/* 1: FullName */}
                <Label htmlFor="fullName" value="Your Full Name"></Label>
                <TextInput
                  type="text"
                  placeholder="Full Name"
                  id="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                ></TextInput>
              </div>
              {/* 2: username */}
              <div>
                <Label htmlFor="userName" value="Your Username" />
                <TextInput
                  type="text"
                  placeholder="Username"
                  id="userName"
                  value={formData.userName}
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
              {/* <div>
                <Label htmlFor="USN" value="Your USN"></Label>
                <TextInput
                  type="text"
                  placeholder="USN"
                  value={formData.USN}
                  onChange={handleChange}
                  required
                ></TextInput>
              </div> */}
              <div>
                <Label htmlFor="password" value="Your Password" />
                <div style={{ position: "relative" }}>
                  <TextInput
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? <BiHide /> : <BiShow />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirmPassword" value="Confirm Password" />
                <div style={{ position: "relative" }}>
                  <TextInput
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="off"
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {showConfirmPassword ? <BiHide /> : <BiShow />}
                  </button>
                </div>
              </div>
              <Button
                className="bg-red-500 dark:bg-red-500 "
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
            <Link to={"/sign-in"} className="text-blue-500 font-semibold">
              Sign In
            </Link>
          </div>
          <div className="flex gap-2 text-sm mt-5">
            <span> Forgot Password:</span>
            <Link to={"/forgot-password"} className="text-blue-500 font-semibold">
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
