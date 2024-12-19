import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Table, TableBody, TableCell, TableRow } from "flowbite-react";
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { Button, Modal } from "flowbite-react";
import { FaCheck } from "react-icons/fa";

export default function DashPosts() {
  const [userPosts, setUserPosts] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const [showMore, setShowMore] = useState(true);
  const [showModel, setShowModel] = useState(false);
  const [postId, setPostId] = useState(null);
  const [verifySuccess, setVerifySuccess] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/post/getposts?${currentUser._id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await res.json();
        if (res.ok) {
          setUserPosts(data.posts);
          if (data.posts.length < 9) {
            setShowMore(false);
          }
        }
      } catch (err) {
        console.log(err.message);
      }
    };

    if (currentUser) {
      fetchPosts();
    }
  }, [currentUser]);
  // handleShowMore function
  const handleShowMore = async () => {
    const startIndex = userPosts.length;
    try {
      const res = await fetch(
        `http://localhost:3000/api/post/getposts?${currentUser._id}&startIndex=${startIndex}`,
        {
          credentials: "include",
          method: "GET",
        }
      );
      const data = await res.json();
      if (res.ok) {
        setUserPosts((prev) => [...prev, ...data.posts]);
        if (data.posts.length < 9) {
          setShowMore(false);
        }
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  // handleDeletePost function
  const handleDeletePost = async () => {
    setShowModel(false);
    try {
      const res = await fetch(
        `http://localhost:3000/api/post/deletepost/${postId}/${currentUser._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        // delete the post from the userPosts state
        setUserPosts((prev) => prev.filter((post) => post._id !== postId));
      }
    } catch (err) {}
  };

  const handleVerifyPost = async (postId) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/post/verifyPost/${postId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (res.ok) {
        setUserPosts((prev) =>
          prev.map((post) =>
            post._id === postId ? { ...post, isVerified: true } : post
          )
        );
        return;
      } else {
        console.log("error while verify the post");
        return;
      }
    } catch (err) {
      console.log(err);
      return;
    }
  };
  return (
    <div
      className="table-auto overflow-x-scroll md:mx-auto scrollbar scrollbar-track-slate-100
    scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-500 dark:scrollbar-track-slate-500"
    >
      {currentUser && userPosts.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date updated</Table.HeadCell>
              <Table.HeadCell>Post image</Table.HeadCell>
              <Table.HeadCell>Post title</Table.HeadCell>
              {/* <Table.HeadCell>Category</Table.HeadCell> */}
              <Table.HeadCell>Verified</Table.HeadCell>
              {currentUser.isAdmin ||currentUser.isModerator ? (
                <Table.HeadCell>Verify Now</Table.HeadCell>
              ) : (
                ""
              )}
              <Table.HeadCell>Delete</Table.HeadCell>
              <Table.HeadCell>
                <span>Edit</span>
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {userPosts.map((post) => (
                <TableRow
                  key={post._id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <TableCell>
                    {new Date(post.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Link to={`/post/${post.slug}`}>
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-20 h-10 object-cover bg-gray-500"
                      ></img>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      className="font-medium text-gray-900 dark:text-white"
                      to={`/post/${post.slug}`}
                    >
                      {post.title}
                    </Link>
                  </TableCell>
                  {/* <TableCell>{post.category}</TableCell> */}
                  <TableCell >
                    <p className={post.isVerified?"text-green-500":""}>{post.isVerified ? "verified" : "not verified"}</p>
                  </TableCell>
                  {currentUser.isAdmin ||currentUser.isModerator ? (
                    <TableCell>
                      {post.isVerified ? (
                        <FaCheck className="text-green-700" />
                      ) : (
                        <button
                          onClick={() => handleVerifyPost(post._id)}
                          className="flex items-center justify-center p-1 rounded-full hover:bg-red-200"
                        >
                          <FaCheck className="text-red-700" />
                        </button>
                      )}
                    </TableCell>
                  ) : (
                    ""
                  )}
                  <TableCell>
                    <span
                      onClick={() => {
                        setShowModel(true);
                        setPostId(post._id);
                      }}
                      className="font-medium text-red-500 hover:underline cursor-pointer"
                    >
                      Delete
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/update-post/${post._id}`}
                      className="text-teal-500 hover:underline"
                    >
                      <span>Edit</span>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </Table.Body>
          </Table>
          {showMore && (
            <button
              className="w-full text-teal-500 self-center text-sm py-7"
              onClick={handleShowMore}
            >
              Show more
            </button>
          )}
        </>
      ) : (
        <p>No posts available</p>
      )}
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
              Are you sure you want to delete your account
            </h3>
            <div className="flex justify-center gap-4 ">
              <Button
                color={"failure"}
                onClick={() => {
                  handleDeletePost();
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
    </div>
  );
}
