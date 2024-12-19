import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  TextInput,
  Select,
  FileInput,
  Alert,
  Modal,
} from "flowbite-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate, useParams } from "react-router-dom";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useSelector } from "react-redux";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export default function UpdatePost() {
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "uncategorized",
    image: "",
    content: "",
  });
  const [publishError, setPublishError] = useState(null);
  const [publishSuccess, setPublishSuccess] = useState(null);
  const [showModel, setShowModel] = useState(false); // For modal visibility
  const [loading, setLoading] = useState(false); // For loading state

  const { postId } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  // Refs to store timer IDs
  const errorTimerRef = useRef(null);
  const successTimerRef = useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/post/getposts?postId=${postId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await res.json();
        if (!res.ok) {
          setPublishError(data.message || "Failed to fetch the post.");
          return;
        }
        setPublishError(null);
        setFormData({
          title: data.posts[0].title,
          category: data.posts[0].category,
          image: data.posts[0].image,
          content: data.posts[0].content,
        });
      } catch (error) {
        console.log(error);
        setPublishError("Failed to fetch the post.");
      }
    };

    fetchPost();
  }, [postId]);

  const handleUploadImage = async () => {
    try {
      if (!file) {
        setImageUploadError("Please select an image to upload");
        return;
      }
      setImageUploadError(null);
      const storage = getStorage();
      const fileName = new Date().getTime() + "-" + file.name;
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
          setImageUploadError("Image upload failed");
          setImageUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUploadError(null);
            setImageUploadProgress(null);
            setFormData((prev) => ({ ...prev, image: downloadURL }));
          });
        }
      );
    } catch (error) {
      console.log(error);
      setImageUploadError("Image upload failed");
      setImageUploadProgress(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading spinner when submitting the post
    try {
      const res = await fetch(
        `http://localhost:3000/api/post/updatepost/${postId}/${currentUser._id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      setLoading(false); // Hide loading spinner after response
      if (!res.ok) {
        setPublishError(data.message || "Failed to update the post.");
        // Start timer to clear error after 5 seconds
        if (errorTimerRef.current) {
          clearTimeout(errorTimerRef.current);
        }
        errorTimerRef.current = setTimeout(() => {
          setPublishError(null);
        }, 5000);
        return;
      }
      setPublishError(null);
      setPublishSuccess("Updated Successfully");

      // Show modal after post update
      setShowModel(true);

      // Start timer to clear success message and redirect after 5 seconds
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
      successTimerRef.current = setTimeout(() => {
        navigate(`/post/${data.slug}`);
      }, 5000);
    } catch (error) {
      console.log(error);
      setPublishError("Something went wrong");
      setLoading(false); // Hide loading spinner in case of error
      // Start timer to clear error after 5 seconds
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
      errorTimerRef.current = setTimeout(() => {
        setPublishError(null);
      }, 5000);
    }
  };

  useEffect(() => {
    // Cleanup timers on component unmount
    return () => {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Update Post</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            type="text"
            placeholder="Title"
            required
            id="title"
            className="flex-1"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            value={formData.title}
          />
          <Select
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, category: e.target.value }))
            }
            value={formData.category}
          >
            <option value="uncategorized">Select a category</option>
            <option value="technology">Technology</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="food">Food</option>
          </Select>
        </div>
        <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
          <FileInput
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <Button
            type="button"
            gradientDuoTone="purpleToBlue"
            size="sm"
            outline
            onClick={handleUploadImage}
            disabled={!!imageUploadProgress}
          >
            {imageUploadProgress ? (
              <div className="w-16 h-16">
                <CircularProgressbar
                  value={imageUploadProgress}
                  text={`${imageUploadProgress}%`}
                />
              </div>
            ) : (
              "Upload Image"
            )}
          </Button>
        </div>
        {imageUploadError && <Alert color="failure">{imageUploadError}</Alert>}
        {formData.image && (
          <img
            src={formData.image}
            alt="uploaded"
            className="w-full h-72 object-cover"
          />
        )}
        <ReactQuill
          theme="snow"
          placeholder="Write something..."
          className="h-72 mb-12"
          required
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, content: value }))
          }
          value={formData.content}
        />
        <Button type="submit" gradientDuoTone="purpleToPink">
          {loading ? "Loading..." : "Update Post"}
        </Button>
        {publishError && <Alert color="failure">{publishError}</Alert>}
        {publishSuccess && <Alert color="success">{publishSuccess}</Alert>}
      </form>

      {/* Modal for post submission */}
      <Modal
        show={showModel}
        onClose={() => setShowModel(false)}
        popup
        size={"md"}
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-green-400 dark:text-green-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-700 dark:text-gray-300">
              Congratulations!
            </h3>
            <p className="mb-5 text-md text-gray-500 dark:text-gray-400">
              Thank you for your valuable contribution. Your post has been
              submitted and is awaiting admin approval.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              You will be redirected to the post page shortly.
            </p>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
