import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../components/OAuth";

export default function SignUp() {
  const [formData, setFormData] = React.useState({});
  const [errorMessage, setErrorMessage] = React.useState(null);
  const [loding, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() }); // if someone adds space in the input field, it will be removed by trim()
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      formData.name === " " ||
      formData.email === " " ||
      formData.password === " "
    ) {
      return setErrorMessage("Please fill all the fields"); // if no return is added, the code will continue to execute
    }
    try {
      setLoading(true);
      setErrorMessage(null); // clean the previous error message
      const res = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      // if same name and email is already present in the database show error message
      if (data.success === false) {
        return setErrorMessage(data.message);
      }
      if(res.ok){
        navigate("/sign-in");
      }
      setLoading(false);
    } catch (err) {
      // user is not able to connect to the server or internet issue
      setLoading(false);
      console.error(err);
     return setErrorMessage(err.message);
    }
  };
  // console.log(formData);
  return (
    <div className="min-h-screen mt-20">
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
        {/* left */}
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

        {/* right */}
        <div className="flex-1">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label value="Your username"></Label>
              <TextInput
                type="text"
                placeholder="Username"
                id="name"
                onChange={handleChange}
              ></TextInput>
            </div>
            <div>
              <Label value="Your email"></Label>
              <TextInput
                type="email"
                placeholder="name@company.com"
                id="email"
                onChange={handleChange}
              ></TextInput>
            </div>
            <div>
              <Label value="Your password"></Label>
              <TextInput
                type="password"
                placeholder="Password"
                id="password"
                onChange={handleChange}
              ></TextInput>
            </div>
            <Button
              gradientDuoTone={"purpleToPink"}
              type="submit"
              disabled={loding}
            >
              {loding ? (
                <>
                  <Spinner size="sm"></Spinner>
                  <span className="pl-3">Loaing...</span>
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
            <OAuth/>
          </form>
          <div className="flex gap-2 text-sm mt-5">
            <span> Have an account:</span>
            <Link to={"/sign-in"} className="text-blue-500">
              Sign In
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
