import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Table, TableBody, TableCell, TableRow } from "flowbite-react";
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { Button, Modal } from "flowbite-react";
import { FaCheck } from "react-icons/fa";

export default function DashUsers() {
  const [users, setUsers] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const [showMore, setShowMore] = useState(true);
  const [showModel, setShowModel] = useState(false);
  const [userIdToDelete, setuserIdToDelete] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
        // console.log('hi from fetchUsers');
      try {
        const res = await fetch(
          `http://localhost:3000/api/users/getusers`,{
            method: "GET",
            credentials: "include",
          }
        );
        // console.log('res',res);
        const data = await res.json();
        console.log('data',data);
        if (res.ok) {
          setUsers(data.users);
          if (data.users.length < 9) {
            setShowMore(false);
          }
        }
      } catch (err) {
        console.log(err.message);
      }
    };

    if (currentUser?.isAdmin) {
        // console.log('yes admin');
      fetchUsers();
    }
  }, [currentUser._id]);
//   console.log(userPosts);
  // handleShowMore function
  const handleShowMore = async () => {
    const startIndex = users.length;
    try {
      const res = await fetch(
        `http://localhost:3000/api/users/getusers?startIndex=${startIndex}`,{
          credentials: "include",
          method: "GET",
        }
      );
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => [...prev, ...data.users]);
        if (data.users.length < 9) {
          setShowMore(false);
        }
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  // handleDeletePost function
  const handleDeleteUser = async () => {
    setShowModel(false);
    console.log('hi from handleDeletePost', userIdToDelete);
    try {
      const res = await fetch(
        `http://localhost:3000/api/users/delete/${userIdToDelete}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();
      if(!res.ok){
             console.log(data.message);
      }else{
        // delete the post from the userPosts state
        setUsers((prev) => prev.filter((user) => user._id !== userIdToDelete));
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
      {currentUser?.isAdmin && users.length>0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date created</Table.HeadCell>
              <Table.HeadCell>User image</Table.HeadCell>
              <Table.HeadCell>Username</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Admin</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
              {/* <Table.HeadCell>
                <span>Edit</span>
              </Table.HeadCell> */}
            </Table.Head>
              {users.map((user) => (
            <Table.Body className="divide-y" key={user._id}>
                <TableRow
                //   key={user._id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {/* <Link to={`/user/${user.slug}`}> */}
                      <img
                        src={user.profilePicture}
                        alt={user.userName}
                        className="w-10 h-10 object-cover bg-gray-500 rounded-full"
                      ></img>
                    {/* </Link> */}
                  </TableCell>
                  <TableCell className={user.isAdmin?"text-red-600":(user.isModerator?"text-violet-600":"")}>
                      {user.userName}
                    {/* </Link> */}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  {/* // if user is admin then show yes else no */}
                  <TableCell>{user.isAdmin ? (<FaCheck className="text-green-700"/>) :(user.isModerator ? (<FaCheck className="text-violet-600"/>):(<FaCheck className="text-red-700"/>))}</TableCell>
                  {/* <TableCell>{user.isAdmin ? "yes" :"no"}</TableCell> */}
                  <TableCell>
                    <span
                      onClick={() => {
                        setShowModel(true);
                        setuserIdToDelete(user._id);
                      }}
                      className="font-medium text-red-500 hover:underline cursor-pointer"
                    >
                      Delete
                    </span>
                  </TableCell>
                  {/* <TableCell> */}
                    {/* <Link
                      to={`/update-post/${post._id}`}
                      className="text-teal-500 hover:underline"
                    >
                      <span>Edit</span>
                    </Link>
                  </TableCell> */}
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
        <p>No users available</p>
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
              Are you sure you want to delete user
            </h3>
            <div className="flex justify-center gap-4 ">
              <Button
                color={"failure"}
                onClick={() => {
                  handleDeleteUser();
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
