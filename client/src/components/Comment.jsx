import React, { useEffect, useState } from "react";
import moment from "moment";
import { FaThumbsUp } from "react-icons/fa";
import { useSelector } from "react-redux";

export default function Comment({ comment, onLike }) {
  const [user, setUser] = useState({});
  const currentUser = useSelector((state) => state.user.currentUser);
  // console.log("This is from Comment.jsx and the comment is  :", comment);
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/users/${comment.userId}`,
          {
            credentials: "include",
            type: "GET",
          }
        );
        const data = await res.json();
        // console.log("Hello are you running.. ", data);
        if (res.ok) {
          setUser(data);
          // console.log("This is from Comment.jsx :", data);
        }
      } catch (err) {
        console.log(err);
      }
    };
    getUser();
  }, [comment.userId]);

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
            {
              comment.numberOfLikes === 0
                ? ``
                : `${comment.numberOfLikes} ${
                    comment.numberOfLikes === 1 ? `like` : `likes`
                  }`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
