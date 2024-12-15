import { Alert, Button, Modal, TextInput, Spinner, Label } from "flowbite-react";
import { useSelector } from "react-redux";
import { useState, useRef, useEffect } from "react";
import { ref, getStorage, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import React from "react";
import {
  updateFailure,
  updateStart,
  updateSuccess,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOutStart,
  signOutSuccess,
  signOutFailure,
} from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";

export default function DashProfile() {
  const dispatch = useDispatch();
  const filePickerRef = useRef();
  const { currentUser, error, loading } = useSelector((state) => state.user);
  const navigate = useNavigate();

  // state for imagefile and imgUrl
  const [imageFile, setImageFile] = useState(null);
  const [imgFileUrl, setImgFileUrl] = useState(null);
  const [imgFileUploadProgress, setImgFileUploadProgress] = useState(null);
  const [imgFileUploadError, setImgFileUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  const [showModel, setShowModel] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  // handleImageChange function
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const imgUrl = URL.createObjectURL(file);
      setImgFileUrl(imgUrl);
    }
  };

  // Upload image to Firebase
  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  const uploadImage = async () => {
    setImageFileUploading(true);
    setImgFileUploadError(null);
    const storage = getStorage();
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImgFileUploadProgress(progress.toFixed(0));
      },
      (error) => {
        setImgFileUploadError("Could not upload image (max size 2MB)");
        setImgFileUploadProgress(null);
        setImgFileUrl(null);
        setImageFile(null);
        setImageFileUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImgFileUrl(downloadURL);
          setFormData({ ...formData, profilePicture: downloadURL });
          setImgFileUploadProgress(null);
          setImageFileUploading(false);
        });
      }
    );
  };

  // handle change in form inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateUserError(null);
    setUpdateUserSuccess(null);
    if (Object.keys(formData).length === 0) {
      setUpdateUserError("Please fill the form");
      return;
    }
    if (imageFileUploading) {
      return;
    }

    try {
      dispatch(updateStart());
      const res = await fetch(`http://localhost:3000/api/users/update/${currentUser._id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setUpdateUserError(data.message);
        dispatch(updateFailure(data.message));
      } else {
        setIsOtpSent(true);
        setUpdateUserSuccess(
          "An OTP has been sent to your email, please enter the otp for verification."
        );
      }
    } catch (err) {
      dispatch(updateFailure(err.message));
      setUpdateUserError(err.message);
    }
  };

  // handle OTP input change
  const handleOtpChange = (e) => {
    setOtp(e.target.value.trim());
  };

  // handle OTP verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim() === "") {
      return setUpdateUserError("Please enter the OTP");
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/verifyOTP", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: currentUser.email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        return setUpdateUserError(data.message || "OTP verification failed");
      }

      // If OTP verification is successful, redirect to the dashboard
      setUpdateUserSuccess("Email verified successfully! Redirecting to your profile...");
      setTimeout(() => {
        navigate("/dashboard?tab=profile");
      }, 5000);
    } catch (err) {
      setUpdateUserError(err.message || "An unexpected error occurred");
    }
  };

  // handle resend OTP
  const handleResendOtp = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/auth/resendOTP", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: currentUser.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setUpdateUserError(data.message || "Failed to resend OTP");
      } else {
        setUpdateUserSuccess("OTP has been resent to your email.");
      }
    } catch (err) {
      setUpdateUserError(err.message || "An unexpected error occurred");
    }
  };

  // handle delete user
  const handleDeleteUser = async () => {
    setShowModel(false);
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`http://localhost:3000/api/users/delete/${currentUser._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        dispatch(deleteUserFailure(data.message));
      } else {
        dispatch(deleteUserSuccess(data));
      }
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
    }
  };

  // handle sign out
  const handleSignOut = async () => {
    try {
      dispatch(signOutStart());
      const res = await fetch("http://localhost:3000/api/users/signout", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        dispatch(signOutFailure(data.message));
      } else {
        dispatch(signOutSuccess());
      }
    } catch (err) {
      dispatch(signOutFailure(err.message));
    }
  };

  useEffect(() => {
    dispatch(updateFailure(null));
    setUpdateUserError(null);
    setUpdateUserSuccess(null);
  }, [dispatch]);

  useEffect(() => {
    if (error || updateUserError || updateUserSuccess) {
      const timer = setTimeout(() => {
        setUpdateUserSuccess(null);
        setUpdateUserError(null);
        dispatch(updateFailure(null));
      }, 7000);
      return () => setTimeout(timer);
    }
  }, [dispatch, error, updateUserError, updateUserSuccess]);
console.log('this is DashProfile and current user is :',currentUser);
  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      {!isOtpSent ? (
        <>
          <h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={filePickerRef}
              hidden
            />
            <div
              className="relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full"
              onClick={() => filePickerRef.current.click()}
            >
              {imgFileUploadProgress && (
                <CircularProgressbar
                  value={imgFileUploadProgress || 0}
                  text={`${imgFileUploadProgress}%`}
                  strokeWidth={5}
                />
              )}
              <img
                src={imgFileUrl || currentUser.profilePicture}
                alt="user"
                className={`rounded-full w-full h-full object-cover border-8 border-[lightgray] ${
                  imgFileUploadProgress && imgFileUploadProgress < 100 && "opacity-60"
                }`}
              />
            </div>
            {imgFileUploadError && <Alert color={"failure"}>{imgFileUploadError}</Alert>}
            <TextInput
              type="text"
              id="userName"
              placeholder="username"
              defaultValue={currentUser.name}
              onChange={handleChange}
            />
            <TextInput
              type="email"
              id="email"
              placeholder="email"
              defaultValue={currentUser.email}
              onChange={handleChange}
            />
            <TextInput
              type="password"
              id="password"
              placeholder="password"
              onChange={handleChange}
            />
            <TextInput
              type="text"
              id="fullName"
              placeholder="full name"
              defaultValue={currentUser.fullName}
              onChange={handleChange}
            />
            <TextInput
              type="text"
              id="github"
              placeholder="github"
              defaultValue={currentUser.github}
              onChange={handleChange}
            />
            <TextInput
              type="text"
              id="linkedIn"
              placeholder="linkedIn"
              defaultValue={currentUser.linkedIn}
              onChange={handleChange}
            />
            <Button
              type="submit"
              gradientDuoTone="purpleToBlue"
              outline
              disabled={loading || imageFileUploading}
            >
              {loading ? "Loading..." : "Update"}
            </Button>
          </form>
          <div className="flex text-red-500 justify-between mt-5">
            <span onClick={() => setShowModel(true)} className="cursor-pointer">
              Delete Account
            </span>
            <span onClick={handleSignOut} className="cursor-pointer">
              Sign Out
            </span>
          </div>
        </>
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
          <Button gradientDuoTone={"greenToBlue"} type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" />
                <span className="pl-3">Verifying...</span>
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>
          <Button color="gray" type="button" onClick={handleResendOtp} disabled={loading}>
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
      {updateUserSuccess && <Alert color={"success"} className="mt-5">{updateUserSuccess}</Alert>}
      {updateUserError && <Alert color={"failure"} className="mt-5">{updateUserError}</Alert>}
      {error && <Alert color={"failure"} className="mt-5">{error}</Alert>}
      <Modal show={showModel} onClose={() => setShowModel(false)} popup size={"md"}>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete your account?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color={"failure"} onClick={handleDeleteUser} className="mr-2">
                Yes, I'm sure
              </Button>
              <Button color={"gray"} onClick={() => setShowModel(false)} className="ml-2">
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
