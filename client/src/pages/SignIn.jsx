import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInStart,
  signInSuccess,
  signInFail,
} from "../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import OAuth from "../components/OAuth";
import { BiShow,BiHide } from "react-icons/bi";

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { loading, error: errorMessage } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Reset error || after 5 seconds
  useEffect(() => {
    dispatch(signInFail(null));
    setFormData({ email: "", password: "" }); // Reset form fields
  }, [dispatch]);

  useEffect(() => {
    if (errorMessage) {
      setFormData({ email: "", password: "" }); // Reset form fields
      const timer = setTimeout(() => {
        dispatch(signInFail(null)); // Reset the error
      }, 7000);

      return () => clearTimeout(timer); // Cleanup the timer on component unmount
    }
  }, [errorMessage, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() }); // if someone adds space in the input field, it will be removed by trim()
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.email ||
      !formData.password ||
      formData.email === " " ||
      formData.password === " "
    ) {
      // return setErrorMessage("Please fill all the fields"); // if no return is added, the code will continue to execute
      return dispatch(signInFail("Please fill all the fields"));
    }
    try {
      // setLoading(true);
      // setErrorMessage(null); // clean the previous error message
      // use redux to dispatch the action
      dispatch(signInStart());
      const res = await fetch("http://localhost:3000/api/auth/signin", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      // if same name and email is already present in the database show error message
      if (data.success === false) {
        setFormData({ email: "", password: "" }); // Reset form fields
        dispatch(signInFail(data.message));
        // return setErrorMessage(data.message);
      }
      if (res.ok) {
        dispatch(signInSuccess(data));
        navigate("/");
      }
      // setLoading(false);
    } catch (err) {
      // user is not able to connect to the server or internet issue
      //   setLoading(false);
      //   console.error(err);
      //  return setErrorMessage(err.message);
      setFormData({ email: "", password: "" }); // Reset form fields
      dispatch(signInFail(err.message || "An unexpected error occurred"));
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
        {/* left */}
        <div className="flex-1">
          <Link to={"#"} className="font-bold text-4xl">
            <img src="/exit (1).png"></img>
            <span className="px-0 py-1  rounded-lg text-text-gray-700 dark:white ">
              ace
            </span>
            <span className="text-blue-500">Connect</span>
          </Link>
          {/* <p className="text-sm mt-5">
            This is a demo project. You can sign in to access the dashboard.
          </p> */}
        </div>

        {/* right */}
        <div className="flex-1">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label value="Your email"></Label>
              <TextInput
                type="email"
                placeholder="name@company.com"
                id="email"
                value={formData.email} // for controllable form data
                onChange={handleChange}
              ></TextInput>
            </div>
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
                  {showPassword ? <BiHide/> : <BiShow />}
                </button>
              </div>
            </div>
            <Button
              // gradientDuoTone={"purpleToPink"}
              className="bg-red-500 dark:bg-red-500 "
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm"></Spinner>
                  <span className="pl-3">Loading...</span>
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <OAuth />
          </form>
          <div className="flex gap-2 text-sm mt-5">
            <span> Don't Have an account:</span>
            <Link to={"/sign-up"} className="text-blue-500 font-semibold">
              Sign Up
            </Link>
          </div>
          <div className="flex gap-2 text-sm mt-5">
            <span> Forgot Password:</span>
            <Link to={"/forgot-password"} className="text-blue-500 font-semibold">
              Reset Password
            </Link>
          </div>
          {/* // display error message */}
          {errorMessage && (
            <Alert className="mt-5" color={"failure"}>
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
