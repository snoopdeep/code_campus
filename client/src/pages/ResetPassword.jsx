import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import OAuth from "../components/OAuth";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../redux/user/userSlice";
import { BiShow,BiHide } from "react-icons/bi";


export default function ResetPassword() {
  const { resetToken } = useParams();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password fields
    if (!formData.password || !formData.confirmPassword) {
      setErrorMessage("Please enter both password fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      setResetPasswordSuccess(null);
      console.log("ResetPassword.jsx token:", resetToken);

      const res = await fetch(
        `http://localhost:3000/api/auth/reset-password/${resetToken}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password: formData.password }),
        }
      );

      const data = await res.json();
      console.log("ResetPassword.jsx response data:", data);

      if (res.ok && data.status === "success") {
        setResetPasswordSuccess("Password changed successfully.");
        setFormData({ password: "", confirmPassword: "" }); // Reset form fields
        dispatch(signInSuccess(data.data));
      } else {
        // Handle server-side errors
        setErrorMessage(data.message || "Something went wrong!");
      }
    } catch (err) {
      console.error("ResetPassword.jsx error:", err);
      setErrorMessage("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Automatically clear success message after 5 seconds and redirect
  useEffect(() => {
    if (resetPasswordSuccess) {
      const timer = setTimeout(() => {
        setResetPasswordSuccess(null);
        navigate("/");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [resetPasswordSuccess, navigate]);

  // Automatically clear error message after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  return (
    <div className="min-h-screen mt-20">
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
        {/* Left Section */}
        <div className="flex-1">
          <Link to={"#"} className="font-bold dark:text-white text-4xl">
            <img src="/reset-password.png" alt="Reset Password Icon" />
            <span className="px-0 py-1 rounded-lg text-gray-700 dark:text-white">
              ace
            </span>
            <span className="text-blue-500">Connect</span>
          </Link>
          <p className="text-sm text-gray-700 dark:text-gray-200 mt-5">
            Please ensure your new password is different from your previous
            password.
          </p>
        </div>

        {/* Right Section */}
        <div className="flex-1">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
              className="bg-red-500 dark:bg-red-500  text-white font-bold py-2 px-4 rounded"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span className="pl-3">Loading...</span>
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
            <OAuth />
          </form>

          {/* Display Success Message */}
          {resetPasswordSuccess && (
            <Alert className="mt-5" color="success">
              {resetPasswordSuccess}
            </Alert>
          )}

          {/* Display Error Message */}
          {errorMessage && (
            <Alert className="mt-5" color="failure">
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
