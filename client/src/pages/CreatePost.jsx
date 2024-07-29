import React from "react";
import { Button, TextInput, Select, FileInput, Alert } from "flowbite-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
// for circular progress bar
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { set } from "mongoose";
export default function CreatePost() {
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishError,setpublishError]=useState(null);
  console.log(formData);

  const handleUploadImage = async () => {
    try {
      if (!file) {
        setImageUploadError("Please select an image to upload");
        setImageUploadProgress(null);
        return;
      }
      console.log(file);
      setImageUploadError(null);
      const storage = getStorage();
      const fileName = new Date().getTime() + file.name;
      console.log(fileName);
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress.toFixed(0));
        },
        (error) => {
          setImageUploadError(error.message);
          setImageUploadProgress(null);
        },
        () => {
          setImageUploadError(null);
          setImageUploadProgress(null);
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setFormData({ ...formData, image: downloadURL });
          });
        }
      );
    } catch (error) {
      console.log(error);
      setImageUploadError(error.message);
      setImageUploadProgress(null);
    }
  };
  const handleSubmit = async(e) => {
    e.preventDefault();
    console.log(formData);
    try{
      const res= await fetch('http://localhost:3000/api/post/create', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data=   await res.json();
      if(!data.ok){
        setpublishError(data.message);
        return;

      }
      if(data.ok){
        setpublishError(null);
        console.log(data);
      }

    }catch(error){
      setpublishError('something went wrong');
      console.log(error);
    } 
    // const response = await fetch("http://localhost:5000/posts", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(formData),
    // });
    // const data = await response.json();
    // console.log(data);

  }
  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">create a post</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            type="text"
            placeholder="Title"
            required
            id="title"
            className="flex-1"
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          ></TextInput>
          <Select
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            <option value={"uncategorized"}>Select a category</option>
            <option value={"technology"}>Leetcode</option>
            <option value={"lifestyle"}>Interview</option>
            <option value={"food"}>Other tech</option>
          </Select>
        </div>
        <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
          <FileInput
            type="file"
            accept="image/*"
            onChange={(e) => {
              setFile(e.target.files[0]),
                setFormData({ ...formData, image: e.target.files[0] });
            }}
          />
          <Button
            type="button"
            gradientDuoTone="purpleToBlue"
            size="sm"
            outline
            onClick={handleUploadImage}
            disabled={imageUploadProgress}
          >
            {imageUploadProgress ? (
              <div className="w-16 h-16">
                <CircularProgressbar
                  value={imageUploadProgress}
                  text={`${imageUploadProgress}%` || 0}
                />
              </div>
            ) : (
              "Upload Image"
            )}
          </Button>
        </div>
        {/* // Display the error message if no image is selected */}
        {imageUploadError && <Alert color="failure">{imageUploadError}</Alert>}
        {/* // Display the uploaded image */}
        {formData.image && (
          <img
            src={formData.image}
            alt="uploaded"
            className="w-full h-72 object-cover"
          />
        )}
        {/* {file && (
          <img
            src={file}
            alt="uploaded"
            className="w-full h-72 object-cover"
          />
        )} */}
        <ReactQuill
          theme="snow"
          placeholder="Write something..."
          className="h-72 mb-12"
          required
          onChange={(value) => setFormData({ ...formData, content: value })}
        />
        <Button type="submit" gradientDuoTone="purpleToPink">
          Publish
        </Button>
        {
          publishError && <Alert color="failure">{publishError}</Alert>
        }
      </form>
    </div>
  );
}
