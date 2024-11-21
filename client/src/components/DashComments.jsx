import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Table, TableCell, TableRow } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { Button, Modal } from "flowbite-react";

export default function DashComments() {
  const [comments, setComments] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const [showMore, setShowMore] = useState(true);
  const [showModel, setShowModel] = useState(false);
  const [commentIdToDelete, setcommentIdToDelete] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/comment/getAllComments`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        // console.log('res',res);
        const data = await res.json();
        console.log("data", data);
        if (res.ok) {
          setComments(data.comments);
          if (data.comments.length < 9) {
            setShowMore(false);
          }
        }
      } catch (err) {
        console.log(err.message);
      }
    };

    if (currentUser?.isAdmin) {
      fetchComments();
    }
  }, [currentUser._id]);
  // handleShowMore function
  const handleShowMore = async () => {
    const startIndex = comments.length;
    try {
      const res = await fetch(
        `http://localhost:3000/api/comment/getAllComments?startIndex=${startIndex}`,
        {
          credentials: "include",
          method: "GET",
        }
      );
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [...prev, ...data.comments]);
        if (data.comments.length < 9) {
          setShowMore(false);
        }
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  // handleDeletePost function
  const handleDeleteComment = async () => {
    setShowModel(false);
    console.log("hi from handleDeletePost", commentIdToDelete);
    try {
      const res = await fetch(
        `http://localhost:3000/api/comment/deleteComment/${commentIdToDelete}`,
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
        setComments((prev) =>
          prev.filter((comment) => comment._id !== commentIdToDelete)
        );
      }
    } catch (err) {
      console.log(err.message);
    }
  };
  return (
    <div
      className="table-auto overflow-x-scroll md:mx-auto scrollbar scrollbar-track-slate-100
    scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-500 dark:scrollbar-track-slate-500"
    >
      {currentUser?.isAdmin && comments.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>DATE UPDATED</Table.HeadCell>
              <Table.HeadCell>COMMENT CONTENT</Table.HeadCell>
              <Table.HeadCell>NUMBER OF LIKES</Table.HeadCell>
              <Table.HeadCell>POSTID</Table.HeadCell>
              <Table.HeadCell>USERID</Table.HeadCell>
              <Table.HeadCell>DELETE</Table.HeadCell>
              {/* <Table.HeadCell>
                <span>Edit</span>
              </Table.HeadCell> */}
            </Table.Head>
            {comments.map((comment) => (
              <Table.Body className="divide-y" key={comment._id}>
                <TableRow
                  //   key={user._id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <TableCell>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{comment.content}</TableCell>
                  <TableCell>{comment.numberOfLikes}</TableCell>
                  <TableCell>{comment.postId}</TableCell>
                  <TableCell>{comment.userId}</TableCell>
                  <TableCell>
                    <span
                      onClick={() => {
                        setShowModel(true);
                        setcommentIdToDelete(comment._id);
                      }}
                      className="font-medium text-red-500 hover:underline cursor-pointer"
                    >
                      Delete
                    </span>
                  </TableCell>
                </TableRow>
              </Table.Body>
            ))}
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
        <p>No comments available</p>
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
              Are you sure you want to detete the comment
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
    </div>
  );
}
