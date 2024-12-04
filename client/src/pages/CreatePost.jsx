import React, { useEffect, useState, useRef, useMemo } from "react";
import { Button, TextInput, Select, FileInput, Alert } from "flowbite-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useNavigate } from "react-router-dom";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
// import "../styles/custom-highlight.css";

// Initialize Highlight.js for syntax highlighting
hljs.configure({
  languages: ["javascript", "python", "ruby", "java", "c++"],
});

export default function CreatePost() {
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "uncategorized",
    content: "",
    image: "",
  });
  const [publishError, setPublishError] = useState(null);
  const [publishSuccess, setPublishSuccess] = useState(null);
  const navigate = useNavigate();
  const quillRef = useRef(null);

  // Memoize modules to prevent unnecessary re-renders
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          [{ font: [] }],
          [{ size: [] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
          ],
          ["link", "image", "video"],
          ["code-block"],
          ["clean"],
        ],
        handlers: {
          image: () => {
            selectLocalImage();
          },
        },
      },
      syntax: {
        highlight: (text) => hljs.highlightAuto(text).value,
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  // Memoize formats to prevent unnecessary re-renders
  const formats = useMemo(
    () => [
      "header",
      "font",
      "size",
      "bold",
      "italic",
      "underline",
      "strike",
      "blockquote",
      "list",
      "bullet",
      "indent",
      "link",
      "image",
      "video",
      "code-block",
    ],
    []
  );

  // Function to handle image selection and upload within Quill
  const selectLocalImage = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = () => {
      const selectedFile = input.files[0];
      if (selectedFile) {
        uploadImage(selectedFile);
      }
    };
  };

  const uploadImage = (selectedFile) => {
    setImageUploadError(null);
    const storage = getStorage();
    const fileName = `${Date.now()}-${selectedFile.name}`;
    const storageRef = ref(storage, `images/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

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
        setImageUploadProgress(null);
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          insertToEditor(downloadURL);
        });
      }
    );
  };

  const insertToEditor = (url) => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection();
      if (range) {
        editor.insertEmbed(range.index, "image", url);
      }
    }
  };

  // Separate Image Upload (Optional: If you want to upload images outside the editor)
  const handleUploadImage = async () => {
    try {
      if (!file) {
        setImageUploadError("Please select an image to upload");
        setImageUploadProgress(null);
        return;
      }
      setImageUploadError(null);
      const storage = getStorage();
      const fileName = `${Date.now()}-${file.name}`;
      const storageRef = ref(storage, `images/${fileName}`);
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

  const handleChangeContent = (value) => {
    setFormData({ ...formData, content: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/post/create", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log("this is create post.jsx and data is ",data);
      if (!res.ok) {
        setPublishError(data.message);
        return;
      }
      if (res.ok) {
        setPublishError(null);
        setPublishSuccess("Post Created Successfully");
        // Navigate after success
        setTimeout(() => {
          navigate(`/post/${data.slug}`);
        }, 1500);
      }
    } catch (error) {
      setPublishError("Something went wrong");
      console.log(error);
    }
  };

  // Clearing the alerts
  useEffect(() => {
    const timer = setTimeout(() => {
      setPublishError(null);
      setPublishSuccess(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [publishError, publishSuccess]);

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Create a Post</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            type="text"
            placeholder="Title"
            required
            id="title"
            className="flex-1"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <Select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            <option value="uncategorized">Select a category</option>
            <option value="technology">Leetcode</option>
            <option value="lifestyle">Interview</option>
            <option value="food">Other tech</option>
          </Select>
        </div>
        <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
          <FileInput
            type="file"
            accept="image/*"
            onChange={(e) => {
              setFile(e.target.files[0]);
              setFormData({ ...formData, image: "" });
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
        {imageUploadError && <Alert color="failure">{imageUploadError}</Alert>}
        {formData.image && (
          <img
            src={formData.image}
            alt="uploaded"
            className="w-full h-72 object-cover"
          />
        )}
        <ReactQuill
          ref={quillRef}
          theme="snow"
          placeholder="Write something..."
          className="h-72 mb-12"
          value={formData.content}
          onChange={handleChangeContent}
          modules={modules}
          formats={formats}
        />
        <Button type="submit" gradientDuoTone="purpleToPink">
          Publish
        </Button>
        {publishError && <Alert color="failure">{publishError}</Alert>}
        {publishSuccess && <Alert color="success">{publishSuccess}</Alert>}
      </form>
    </div>
  );
}
