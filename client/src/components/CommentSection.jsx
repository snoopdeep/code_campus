import { Alert, Button, Textarea } from "flowbite-react";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useState } from "react";
import Comment from "./Comment";

export default function CommentSection({ postId }) {
  const { currentUser } = useSelector((state) => state.user);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState(null);
  const [comments, setComments] = useState([]);
  console.log("comments are ", comments);
  console.log("post id is ", postId);
  console.log("current user is ", currentUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.length > 500) {
      return;
    }
    try {
      setCommentError(null);
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
      if (res.ok) {
        setComment("");
        setCommentError(null);
        setComments([data, ...comments]);
      }
    } catch (err) {
      setCommentError("Something went wrong, please try again later");
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
            <Button outline gradientDuoTone={"purpleToBlue"} type="submit">
              Submit
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
          // <React.Fragment key={comment._id}>
            <Comment key={comment._id} comment={comment} />
          // </React.Fragment>
        ))}
        
      </>
    </div>
  );
}
