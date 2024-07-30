import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Table, TableBody, TableCell, TableRow } from "flowbite-react";
import { Link } from "react-router-dom";

export default function DashPosts() {
  const [userPosts, setUserPosts] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const [showMore, setShowMore] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/post/getposts?${currentUser._id}`
        );
        const data = await res.json();
        if (res.ok) {
          setUserPosts(data.posts);
          if(data.posts.length < 9) {
            setShowMore(false);
          }
        }
      } catch (err) {
        console.log(err.message);
      }
    };

    if (currentUser?.isAdmin) {
      fetchPosts();
    }
  }, [currentUser]);
  console.log(userPosts);
// handleShowMore function
const handleShowMore = async () => {
  const startIndex=userPosts.length;
  try{
    const res= await fetch(`http://localhost:3000/api/post/getposts?${currentUser._id}&startIndex=${startIndex}`);
    const data=await res.json();
    if(res.ok){
      setUserPosts((prev)=>[...prev,...data.posts]);
      if(data.posts.length<9){
        setShowMore(false);
    }
  }

  }catch(err){
    console.log(err.message);
  }
}
  return (
    <div
      className="table-auto overflow-x-scroll md:mx-auto scrollbar scrollbar-track-slate-100
    scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-500 dark:scrollbar-track-slate-500"
    >
      {currentUser?.isAdmin && userPosts.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date updated</Table.HeadCell>
              <Table.HeadCell>Post image</Table.HeadCell>
              <Table.HeadCell>Post title</Table.HeadCell>
              <Table.HeadCell>Category</Table.HeadCell>
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
                  <TableCell>{post.category}</TableCell>
                  <TableCell>
                    <span className="font-medium text-red-500 hover:underline cursor-pointer">
                      Delete
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link to={`/update-post/${post._id}`} className="text-teal-500 hover:underline">
                      <span>Edit</span>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </Table.Body>
          </Table>
          {
            showMore&&(
              <button className="w-full text-teal-500 self-center text-sm py-7" onClick={handleShowMore}>
                Show more
              </button>
            )
          }
        </>
      ) : (
        <p>No posts available</p>
      )}
    </div>
  );
}
