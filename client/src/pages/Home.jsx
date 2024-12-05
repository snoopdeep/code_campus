import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CallToAction from "../components/CallToAction.jsx";
import PostCard from "../components/PostCard.jsx";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [posts, setPost] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  console.log("current user is :", currentUser);
  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch("http://localhost:3000/api/post/getAllPosts", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (data) setPost(data.posts);
    };
    fetchPosts();
  }, []);

  console.log(posts);
  const handleImageClick = () => {
    if (currentUser) {
      navigate("/create-post");
    } else {
      navigate("/sign-in");
    }
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-20 p-6 lg:p-28 px-3 max-w-6xl mx-auto">
        {/* Left Section (60%) */}
        <div className="lg:w-3/5 flex flex-col justify-center">
          <h1 className="text-3xl font-bold lg:text-5xl">
            Welcome to CodeCampus
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-4">
            A platform where students share their interview
            experiences, tips, and insights to help each other succeed. <br />
            Whether you're preparing for your first job or advancing your
            career, CodeCampus is here to guide you every step of the way.
          </p>
          <Link
            to={"/search"}
            className="text-sm sm:text-base font-bold text-teal-500 hover:underline mt-4"
          >
            See All Posts
          </Link>
        </div>

        {/* Right Section (40%) */}
        <div className="lg:w-2/5 flex justify-center items-center">
          <img
            src="/post.gif"
            alt="CodeCampus Illustration"
            className="w-4/4 h-auto rounded-lg shadow-lg"
            onClick={handleImageClick}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 py-7">
        {posts && posts.length > 0 && (
          <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-semibold text-center">Recent Posts</h1>
            <div className="flex flex-wrap gap-4">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
            <Link
              to={"/search"}
              className="text-lg font-bold text-teal-500 hover:underline text-center"
            >
              View All Posts
            </Link>
          </div>
        )}
      </div>

      <div className="p-3 bg-amber-100 dark:bg-slate-500">
        <CallToAction />
      </div>
    </div>
  );
}
