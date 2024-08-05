import React, { useEffect, useState } from "react";
import moment from "moment";

export default function Comment({ comment }) {
  const [user, setUser] = useState({});
  console.log("This is from Comment.jsx and the comment is  :", comment);
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
        console.log("Hello are you running.. ", data);
        if (res.ok) {
          setUser(data);
          console.log("This is from Comment.jsx :", data);
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
        <div  className="flex items-center mb-1" >
          <span className="font-bold mr-1 text-xs truncate">{user ? `@${user.name}` : `anonymous user`}</span>
          <span className="text-gray-500 text-xs">
            {moment(comment.createdAt).fromNow()}
          </span>
        </div>
        <p className="text-gray-500 mb-2">
          {comment.content}
        </p>
      </div>
    </div>
  );
}
