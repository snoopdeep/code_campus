import { Alert, Button, Modal, TextInput } from "flowbite-react";
import { useSelector } from "react-redux";
import { useState, useRef, useEffect } from "react";
import {
  ref,
  getStorage,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
// for circular progress bar
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
import { Link } from "react-router-dom";

export default function DashProfile() {
  const dispatch = useDispatch();
  const filePickerRef = useRef();
  const { currentUser, error, loading } = useSelector((state) => state.user);
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
  console.log(
    "currentUser :",
    currentUser,
    "error: ",
    error,
    "loading :",
    loading
  );
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    // console.log(file);
    if (file) {
      setImageFile(file);
      const imgUrl = URL.createObjectURL(file);
      setImgFileUrl(imgUrl);
    }
  };
  // if any new file is uplaoded then update uplaod that file to real storage
  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);
  const uploadImage = async () => {
    // service firebase.storage {
    //   match /b/{bucket}/o {
    //     match /{allPaths=**} {
    //       allow read;
    //       allow write: if
    //       request.resource.size<2*1024*1024 &&
    //       request.resource.contentType.matches('image/.*')
    //     }
    //   }
    // }
    // when start set error to null
    setImageFileUploading(true);
    setImgFileUploadError(null);
    const storage = getStorage();
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        // progress== 10.232 45.34 so trucate it to 0 decimal
        setImgFileUploadProgress(progress.toFixed(0));
      },
      (error) => {
        setImgFileUploadError("could not upload image (max size 2mb)");
        // set uploadImgProgress to null
        setImgFileUploadProgress(null);
        setImgFileUrl(null);
        setImageFile(null);
        setImageFileUploading(false);
        // setImgFileUploadError(null);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImgFileUrl(downloadURL);
          setFormData({ ...formData, profilePicture: downloadURL });
          console.log("File uploaded successfully", downloadURL);
          setImgFileUploadProgress(null);
          setImageFileUploading(false);
        });
      }
    );
  };

  // Handle clearing the error after 5 seconds
  useEffect(() => {
    if (imgFileUploadError) {
      const timer = setTimeout(() => {
        setImgFileUploadError(null);
      }, 3000);

      // Cleanup function to clear the timeout if the component unmounts
      return () => clearTimeout(timer);
    }
  }, [imgFileUploadError]); // Only re-run the effect if the error state changes

  // handleChange function
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
      const res = await fetch(
        `http://localhost:3000/api/users/update/${currentUser._id}`,
        {
          method: "PUT",
          credentials: "include", // Ensures cookies are included in the request
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setUpdateUserError(data.message);
        dispatch(updateFailure(data.message));
      } else {
        // if everything is fine then update the user
        setUpdateUserSuccess("User updated successfully");
        dispatch(updateSuccess(data));
      }
    } catch (err) {
      dispatch(updateFailure(err.message));
      setUpdateUserError(err.message);
    }
  };
  // handle delete user
  const handleDeleteUser = async () => {
    console.log("delete user");
    setShowModel(false);
    try {
      dispatch(deleteUserStart());
      const res = await fetch(
        `http://localhost:3000/api/users/delete/${currentUser._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        dispatch(deleteUserFailure(data.message));
      } else {
        dispatch(deleteUserSuccess(data));
      }
    } catch (err) {
      console.log(err);
      dispatch(deleteUserFailure(err.message));
    }
    return;
  };

  // handle signout
  const handleSignOut = async () => {
    try {
      dispatch(signOutStart());
      const res = await fetch("http://localhost:3000/api/users/signout", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
        dispatch(signOutFailure(data.message));
      } else {
        dispatch(signOutSuccess());
      }
    } catch (err) {
      console.log(err);
      dispatch(signOutFailure(err.message));
    }
  };
  // clearing the error message on refresh or after 7 sec
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
  return (
    <div className=" max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={filePickerRef}
          hidden
        ></input>
        <div
          className=" relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full"
          onClick={() => {
            filePickerRef.current.click();
          }}
        >
          {/* // add circular progress bar */}
          {imgFileUploadProgress && (
            <CircularProgressbar
              value={imgFileUploadProgress || 0}
              text={`${imgFileUploadProgress}%`}
              strokeWidth={5}
              styles={{
                root: {
                  height: "100%",
                  width: "100%",
                  position: "relative",
                  top: 0,
                  left: 0,
                },
                path: {
                  stroke: `rgba(62, 152, 199), ${imgFileUploadProgress / 100})`,
                },
              }}
            />
          )}

          <img
            src={imgFileUrl || currentUser.profilePicture}
            alt="user"
            className={`rounded-full w-full h-full object-cover border-8 border-[lightgray]
            ${
              imgFileUploadProgress &&
              imgFileUploadProgress < 100 &&
              "opacity-60"
            }
            `}
          ></img>
        </div>
        {/* // show error when file not uploaded */}
        {imgFileUploadError && (
          <Alert color={"failure"}>{imgFileUploadError}</Alert>
        )}
        <TextInput
          type="text"
          id="username"
          placeholder="username"
          defaultValue={currentUser.name}
          onChange={handleChange}
        ></TextInput>
        <TextInput
          type="email"
          id="email"
          placeholder="email"
          defaultValue={currentUser.email}
          onChange={handleChange}
        ></TextInput>
        <TextInput
          type="password"
          id="password"
          placeholder="password"
          onChange={handleChange}
        ></TextInput>
        <Button
          type="submit"
          gradientDuoTone="purpleToBlue"
          outline
          disabled={loading || imageFileUploading}
        >
          {loading ? "Loading..." : "Update"}
        </Button>
        {currentUser &&( 
          // .isAdmin && changing that all the verified user can post a blog
          <Link to={"/create-post"}>
            <Button
              type="button"
              gradientDuoTone={"purpleToBlue"}
              className="w-full"
            >
              Create a post
            </Button>
          </Link>
        )}
      </form>
      <div className=" flex text-red-500 justify-between mt-5">
        <span onClick={() => setShowModel(true)} className="cursor-pointer">
          Delete Account
        </span>
        <span onClick={handleSignOut} className="cursor-pointer">
          Sign Out
        </span>
      </div>
      {updateUserSuccess && (
        <Alert color={"success"} className="mt-5">
          {updateUserSuccess}
        </Alert>
      )}
      {updateUserError && (
        <Alert color={"failure"} className="mt-5">
          {updateUserError}
        </Alert>
      )}
      {error && (
        <Alert color={"failure"} className="mt-5">
          {error}
        </Alert>
      )}
      <Modal
        show={showModel}
        onClose={() => setShowModel(false)}
        popup
        size={"md"}
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete your account
            </h3>
            <div className="flex justify-center gap-4 ">
              <Button
                color={"failure"}
                onClick={() => {
                  handleDeleteUser();
                }}
                className="mr-2"
              >
                Yes, I'm sure
              </Button>
              <Button
                color={"gray"}
                onClick={() => setShowModel(false)}
                className="ml-2"
              >
                No, cancle
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
