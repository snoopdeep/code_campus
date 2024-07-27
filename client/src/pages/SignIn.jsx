import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInStart,signInSuccess,signInFail } from "../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import OAuth from "../components/OAuth";


export default function SignIn() {
  const [formData, setFormData] = React.useState({});
  const { loding, error:errorMessage } = useSelector((state) => state.user);
  // const [errorMessage, setErrorMessage] = React.useState(null);
  // const [loding, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      // if same name and email is already present in the database show error message
      if (data.success === false) {
        dispatch(signInFail(data.message));
        // return setErrorMessage(data.message);
      }
      if(res.ok){
        dispatch(signInSuccess(data));
        navigate("/");
      }
      // setLoading(false);
    } catch (err) {
      // user is not able to connect to the server or internet issue
    //   setLoading(false);
    //   console.error(err);
    //  return setErrorMessage(err.message);
    dispatch(signInFail(err.message));
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
            This is a demo project. You can sign in to access the dashboard.
          </p>
        </div>

        {/* right */}
        <div className="flex-1">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* <div>
              <Label value="Your username"></Label>
              <TextInput
                type="text"
                placeholder="Username"
                id="name"
                onChange={handleChange}
              ></TextInput>
            </div> */}
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
                placeholder="*******"
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
                "Sign In"
              )}
            </Button>
            <OAuth/>
          </form>
          <div className="flex gap-2 text-sm mt-5">
            <span> Don't Have an account:</span>
            <Link to={"/sign-up"} className="text-blue-500">
              Sign Up
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
