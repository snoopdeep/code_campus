import { Button } from "flowbite-react";
import React from "react";
import { AiFillGoogleCircle } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { app } from "../firebase";

import {
  signInStart,
  signInSuccess,
  signInFail,
} from "../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default  function  OAuth() {
  const auth = getAuth(app);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleGoogleClick = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" }); // it will always prompt the user to select the account
    try {
      const resultFromGoogle = await signInWithPopup(auth, provider);
      // SEND the information to the backend
      const res = await fetch("http://localhost:3000/api/auth/google", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: `${resultFromGoogle.user.displayName.split(' ').join('.').toLowerCase()}.${resultFromGoogle.user.email.split('@')[0]}`,
          fullName:resultFromGoogle.user.displayName,
          email: resultFromGoogle.user.email.toLocaleLowerCase(),
          googlePhotoURL: resultFromGoogle.user.photoURL,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(signInSuccess(data));
      }
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Button
      type="button"
      // gradientDuoTone="pinkToOrange"
      outline
      onClick={handleGoogleClick}
    >
      {/* <AiFillGoogleCircle className="w-6 h-6 mr-2" /> */}
      <FcGoogle className="w-5 h-5 mr-8 centre" />
      Sign Up with Google
    </Button>
  );
}
