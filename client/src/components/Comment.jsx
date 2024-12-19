import React, { useEffect, useState } from "react";
import moment from "moment";
import { FaThumbsUp } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Button, Textarea, Spinner, Alert } from "flowbite-react";
import UserProfileModal from "./UserProfileModal";

export default function Comment({ comment, onLike, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const currentUser = useSelector((state) => state.user.currentUser);
  const [showModel, setShowModel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editError, setEditError] = useState(""); 

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(comment.content);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setEditError("");
      const response = await fetch(
        `http://localhost:3000/api/comment/editComment/${comment._id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: editedContent,
          }),
        }
      );
      const data = await response.json();

      if (data.status === "comment can't be posted") {
        setEditError(data.message);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setEditError("An error occurred while editing the comment.");
        setLoading(false);
        return;
      }

      setLoading(false);
      setIsEditing(false);
      onEdit(comment._id, editedContent);
    } catch (err) {
      setLoading(false);
      setEditError(
        err.message || "An error occurred while editing the comment."
      );
      console.log(err);
    }
  };

  useEffect(() => {
    let timer;
    if (editError) {
      timer = setTimeout(() => {
        setEditError("");
      }, 6000);
    }
    return () => clearTimeout(timer);
  }, [editError]);

  return (
    <div className="flex p-4 border-b dark:border-gray-600 text-sm">
      <div className="flex-shrink-0 mr-3">
        <img
          className="w-10 h-10 rounded-full bg-gray-200"
          src={comment.userId.profilePicture}
          alt={comment.userId.userName}
          onClick={() => setShowModel(true)}
          style={{ cursor: "pointer" }}
        ></img>
      </div>
      <div className="flex-1">
        <div className="flex items-center mb-1">
          <span
            className={
              comment?.userId?.isAdmin
                ? "font-bold mr-1 text-xs text-red-600 truncate"
                : comment?.userId?.isModerator
                ? "font-bold mr-1 text-xs text-violet-700 truncate"
                : "font-bold mr-1 text-xs truncate"
            }
          >
            {comment?.userId?.userName
              ? `@${comment.userId.userName}`
              : `anonymous user`}
          </span>
          <span className="text-gray-500 text-xs">
            {moment(comment.createdAt).fromNow()}
          </span>
        </div>
        {isEditing ? (
          <>
            <Textarea
              className="mb-2"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <div className="flex justify-end gap-2 text-xm">
              <Button
                type="button"
                size="sm"
                gradientDuoTone="purpleToBlue"
                onClick={handleSave}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Spinner size="sm" aria-label="Loading..." />
                    <span className="pl-3">Analyzing the comment...</span>
                  </div>
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                gradientDuoTone="purpleToBlue"
                outline
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
            {editError && (
              <Alert color={"failure"} className="mt-5">
                {editError}
              </Alert>
            )}
          </>
        ) : (
          <>
            <p className="text-gray-700 dark:text-gray-400 mb-2">
              {comment.content}
            </p>
            <div className="flex items-center pt-2 text-xs border-t dark:border-gray-700 max-w-fit gap-2">
              <button
                className={
                  currentUser && comment.likes.includes(currentUser._id)
                    ? `text-blue-500`
                    : `text-gray-400 hover:text-blue-500`
                }
                type="button"
                onClick={() => onLike(comment._id)}
              >
                <FaThumbsUp className="text-sm" />
              </button>
              <p className="text-gray-400">
                {comment.numberOfLikes === 0
                  ? ``
                  : `${comment.numberOfLikes} ${
                      comment.numberOfLikes === 1 ? `like` : `likes`
                    }`}
              </p>
              {currentUser &&
                (currentUser._id === comment.userId._id ||
                  currentUser.isAdmin) && (
                  <>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-blue-400"
                      onClick={handleEdit}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="text-red-400 hover:text-red-900"
                      onClick={() => onDelete(comment._id)}
                    >
                      Delete
                    </button>
                  </>
                )}
            </div>
          </>
        )}
      </div>
      {/* Reusable UserProfileModal component */}
      <UserProfileModal
        show={showModel}
        onClose={() => setShowModel(false)}
        user={comment?.userId}
      />
    </div>
  );
}
