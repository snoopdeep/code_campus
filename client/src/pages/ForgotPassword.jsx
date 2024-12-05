import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../components/OAuth";

export default function ForgotPassword() {
  const [formData, setFormData] = useState({
    email: "",
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email field
    if (!formData.email) {
      setErrorMessage("Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      setForgotSuccessMessage(null);

      const res = await fetch(
        "http://localhost:3000/api/auth/forget-password",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();
      console.log("ForgotPassword.jsx response data:", data);

      if (res.ok && data.status === "success") {
        setForgotSuccessMessage(
          "Password reset link successfully sent to your email. Please use the link to reset your password!"
        );
        setFormData({ email: "" }); // Reset form fields

        // Redirect after 5 seconds
        const timer = setTimeout(() => {
          navigate("/sign-in");
        }, 5000);

        return () => clearTimeout(timer);
      } else {
        // Handle server-side errors
        setErrorMessage(data.message || "Something went wrong!");
      }
    } catch (err) {
      console.error("ForgotPassword.jsx error:", err);
      setErrorMessage("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Automatically clear success message after 5 seconds and redirect
  useEffect(() => {
    if (forgotSuccessMessage) {
      const timer = setTimeout(() => {
        setForgotSuccessMessage(null);
        navigate("/sign-in");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [forgotSuccessMessage, navigate]);

  // Automatically clear error message after 7 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  return (
    <div className="min-h-screen mt-20">
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
        {/* Left Section */}
        <div className="flex-1">
          <Link to="/" className="font-bold dark:text-white text-4xl">
            <span className="px-2 py-1 bg-gradient-to-r from-orange-500 via-white-500 to-green-500 rounded-lg text-white">
              code
            </span>
            Campus
          </Link>
          <p className="text-sm mt-5">
            This is a demo project. You can sign in to access the dashboard.
          </p>
        </div>

        {/* Right Section */}
        <div className="flex-1">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">Enter Your Email</Label>
              <TextInput
                type="email"
                placeholder="name@company.com"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <Button
              gradientDuoTone="purpleToPink"
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
          <div className="flex gap-2 text-sm mt-5">
            <span>Don't have an account:</span>
            <Link to="/sign-up" className="text-blue-500">
              Sign Up
            </Link>
          </div>

          {/* Display Success Message */}
          {forgotSuccessMessage && (
            <Alert className="mt-5" color="success">
              {forgotSuccessMessage}
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
