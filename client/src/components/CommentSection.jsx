import { Alert, Button, Textarea, Spinner } from "flowbite-react";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useState } from "react";
import Comment from "./Comment";
import { useNavigate } from "react-router-dom";
import { Modal } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export default function CommentSection({ postId }) {
  const { currentUser } = useSelector((state) => state.user);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState(null);
  const [comments, setComments] = useState([]);
  const [showModel, setShowModel] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // console.log("comments are ", comments);
  // console.log("post id is ", postId);
  console.log("current user is ", currentUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.length > 500) {
      return;
    }
    try {
      setCommentError(null);
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/comment/create", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: comment,
          postId: postId,
          userId: currentUser._id,
        }),
      });
      const data = await res.json();
      console.log(data);
      // restrict the bad/ toxic comment
      if (data.status === "comment can't be posted") {
        setCommentError(data.message);
        setLoading(false);
        return;
      }
      if (res.ok) {
        setComment("");
        setCommentError(null);
        setLoading(false);
        setComments([data, ...comments]);
      }
    } catch (err) {
      setCommentError("Something went wrong, please try again later");
      setLoading(false);
      console.log(err);
    }
  };
  // console.log("comment is : ", comment);
  useEffect(() => {
    const getConmments = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/comment/getPostComments/${postId}`
        );
        if (res.ok) {
          const data = await res.json();
          setComments(data);
          // console.log(data);
        }
      } catch (err) {
        console.log(err);
      }
    };
    getConmments();
  }, [postId]);

  const handleLikeComment = async (commentId) => {
    // console.log("hi from handle like comment");
    try {
      if (!currentUser) {
        navigate("/sign-in");
        return;
      }
      const res = await fetch(
        `http://localhost:3000/api/comment/likeComment/${commentId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setComments(
          comments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  likes: data.likes,
                  numberOfLikes: data.numberOfLikes,
                }
              : comment
          )
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleEdit = function (commentID, updatedComment) {
    console.log("this is handle edit.. ");
    console.log(commentID, updatedComment);
    setComments(
      comments.map((comment) => {
        return comment._id === commentID
          ? { ...comment, content: updatedComment }
          : comment;
        // if that comment match then only change the content of it else set to comment only for others..
      })
    );
  };
  const handleDeleteComment = async () => {
    setShowModel(false);
    try {
      if (!currentUser) {
        navigate("/sign-in");
        return;
      }
      const response = await fetch(
        `http://localhost:3000/api/comment/deleteComment/${commentToDelete}`,
        {
          credentials: "include",
          method: "DELETE",
        }
      );
      setComments(
        comments.filter((comment) => comment._id !== commentToDelete)
      );
    } catch (err) {
      console.log(err);
    }
  };
  // Clear the commentError after 5 seconds
  useEffect(() => {
    if (commentError) {
      const timer = setTimeout(() => {
        setCommentError(null);
        setComment("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [commentError]);
  return (
    <div className="max-w-2xl mx-auto w-full p-3">
      {currentUser ? (
        <div className="flex items-center gap-1 my-5 text-gray-500 text-sm">
          <p>Signed in as:</p>
          <img
            className="h-5 w-5 object-cover rounded-full"
            src={currentUser.profilePicture}
          ></img>
          <Link
            className="text-xs text-cyan-500 hover:underline"
            to={"/dashboard?tab=profile"}
          >
            @{currentUser.name}
          </Link>
        </div>
      ) : (
        <div className="text-sm text-teal-500 my-5 flex gap-1">
          You need to be signed in to comment
          <Link className="text-blue-500 hover:underline" to={"/sign-in"}>
            Sign In
          </Link>
        </div>
      )}
      {currentUser && (
        <form
          onSubmit={handleSubmit}
          className="border border-teal-500 rounded-md p-3"
        >
          <Textarea
            placeholder="Add a comment..."
            rows={3}
            maxLength={500}
            onChange={(e) => setComment(e.target.value)}
            value={comment}
          ></Textarea>
          <div className="flex justify-between items-center mt-5">
            <p className="text-gray-500 text-xs">
              {500 - comment.length} character remaining..
            </p>
            <Button
              outline
              gradientDuoTone={"purpleToBlue"}
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <Spinner size="sm" aria-label="Loading..." />
                  <span className="pl-3">Analying the comment...</span>
                </div>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
          {commentError && (
            <Alert color={"failure"} className="mt-5">
              {commentError}
            </Alert>
          )}
        </form>
      )}
      <>
        {comments.length == 0 ? (
          <p className="text-sm my-5">No comments yet!</p>
        ) : (
          <div className="text-sm my-5 flex items-center gap-1">
            <p>Comments</p>
            <div className="border border-gray-50 py-1 px-2 rounded-sm ">
              <p>{comments.length}</p>
            </div>
          </div>
        )}
        {comments.map((comment) => (
          <Comment
            key={comment._id}
            comment={comment}
            onLike={handleLikeComment}
            onEdit={handleEdit}
            onDelete={(commentId) => {
              setShowModel(true);
              setCommentToDelete(commentId);
            }}
          />
        ))}
        {/* //pop up model */}
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
                Are you sure you want to delete this comment?
              </h3>
              <div className="flex justify-center gap-4 ">
                <Button
                  color={"failure"}
                  onClick={() => {
                    handleDeleteComment();
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
      </>
    </div>
  );
}
