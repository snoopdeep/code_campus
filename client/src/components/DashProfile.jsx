import { Alert, Button, TextInput } from "flowbite-react";
import { useSelector } from "react-redux";
import { useState, useRef, useEffect } from "react";
import { getStorage } from "firebase/storage";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// for circular progress bar
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import React from "react";

export default function DashProfile() {
  const filePickerRef = useRef();
  const { currentUser } = useSelector((state) => state.user);
  // state for imagefile and imgUrl
  const [imageFile, setImageFile] = useState(null);
  const [imgFileUrl, setImgFileUrl] = useState(null);
  const [imgFileUploadProgress, setImgFileUploadProgress] = useState(null);
  const [imgFileUploadError, setImgFileUploadError] = useState(null);
  // console.log("currentUser", currentUser.email);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log(file);
    if (file) {
      setImageFile(file);
      const imgUrl = URL.createObjectURL(file);
      setImgFileUrl(imgUrl);
    }
  };
  // console.log(
  //   "imageFile in browser:",
  //   imageFile,
  //   "imgUri in browser",
  //   imgFileUrl
  // );
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
        // setImgFileUploadError(null);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImgFileUrl(downloadURL);
          console.log("File uploaded successfully", downloadURL);
          setImgFileUploadProgress(null);
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

  console.log(imgFileUploadError, imgFileUploadProgress);
  console.log("imageFile:", imageFile, "imgUri", imgFileUrl);
  return (
    <div className=" max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>
      <form className="flex flex-col gap-4">
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
        ></TextInput>
        <TextInput
          type="email"
          id="email"
          placeholder="email"
          defaultValue={currentUser.email}
        ></TextInput>
        <TextInput
          type="password"
          id="password"
          placeholder="password"
        ></TextInput>
        <Button type="submit" gradientDuoTone="purpleToBlue" outline>
          Update
        </Button>
      </form>
      <div className=" flex text-red-500 justify-between mt-5">
        <span className="cursor-pointer">Delete Account</span>
        <span className="cursor-pointer">Sign Out</span>
      </div>
    </div>
  );
}
