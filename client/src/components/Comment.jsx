import React, { useEffect, useState } from "react";
import moment from "moment";
import { FaThumbsUp } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Button, Textarea } from "flowbite-react";

export default function Comment({ comment, onLike,onEdit,onDelete }) {
  const [user, setUser] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const currentUser = useSelector((state) => state.user.currentUser);
  console.log(comment);
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/users/${comment.userId}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        if (res.ok) {
          setUser(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    getUser();
  }, [comment.userId]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(comment.content);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/comment/editComment/${comment._id}`,
        {
          method: "PUT",
          credentials:"include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: editedContent,
          }),
        }
      );
      console.log(response);
      if(response.ok){
        onEdit(comment._id,editedContent);
        setIsEditing(false);
      }
    } catch (err) {
      console.log(err);
    }
  };
  console.log('this is Comment.jsx and user is',user);
  return (
    <div className="flex p-4 border-b dark:border-gray-600 text-sm">
      <div className="flex-shrink-0 mr-3">
        <img
          className="w-10 h-10 rounded-full bg-gray-200"
          src={user.profilePicture}
          alt={user.name}
        ></img>
      </div>
      <div className="flex-1">
        <div className="flex items-center mb-1">
          <span className="font-bold mr-1 text-xs truncate">
            {user ? `@${user.name}` : `anonymous user`}
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
                Save
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
          </>
        ) : (
          <>
            <p className="text-gray-500 mb-2">{comment.content}</p>
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
                (currentUser._id === comment.userId || currentUser.isAdmin) && (
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
                    onClick={()=>onDelete(comment._id)}
                  >
                    Delete
                  </button>
                  </>
                  
                )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
