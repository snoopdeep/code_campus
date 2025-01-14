import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Spinner, Modal } from "flowbite-react";
import CallToAction from "../components/CallToAction";
import CommentSection from "../components/CommentSection";
import PostCard from "../components/PostCard";
import DOMPurify from "dompurify";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import UserProfileModal from "../components/UserProfileModal";
// import '../styles/custom-highlight.css'; // Correct relative path
// import "highlight.js/styles/monokai.css";

export default function PostPage() {
  const { postSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState(null);
  const [showModel, setShowModel] = useState(false);


  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:3000/api/post/getVerifiedAndunVerifiedPost?slug=${postSlug}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await res.json();
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        if (res.ok) {
          setPost(data.post);
          setLoading(false);
          setError(false);
        }
      } catch (error) {
        setError(true);
        setLoading(false);
        console.log(error);
      }
    };
    fetchPost();
  }, [postSlug]);


  useEffect(() => {
    const getRecentPost = async () => {
      try {
        const posts = await fetch(
          `http://localhost:3000/api/post/getAllPosts?limit=3`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await posts.json();
        if (data) {
          setRecentPosts(data.posts);
        }
      } catch (err) {
        console.log(err.message);
      }
    };
    getRecentPost();
  }, []);

  // Highlight code blocks after content is loaded
  useEffect(() => {
    if (post) {
      document.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightBlock(block);
      });
    }
  }, [post]);

  if (loading)
    return (
      <div>
        <div className="flex justify-center items-center min-h-screen">
          <Spinner size="xl"></Spinner>
        </div>
      </div>
    );

  // Sanitize and prepare HTML content
  const sanitizedContent = post
    ? DOMPurify.sanitize(post.content, {
        ALLOWED_TAGS: [
          "p",
          "br",
          "strong",
          "em",
          "u",
          "s",
          "a",
          "ul",
          "ol",
          "li",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "blockquote",
          "code",
          "pre",
          "img",
        ],
        ALLOWED_ATTR: ["href", "src", "alt", "class"],
      })
    : "";

  return (
    <main className="p-3 flex flex-col max-w-6xl mx-auto min-h-screen">
      <h1 className="text-3xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-4xl">
        {post && post.title}
      </h1>
      <Link
        to={`/search?category=${post && post.category}`}
        className="self-center mt-5"
      >
        <Button color="gray" pill size="xs">
          {post && post.category}
        </Button>
      </Link>
      <img
        src={post && post.image}
        alt={post && post.title}
        className="mt-10 p-3 max-h-[600px] w-full object-cover"
      />
      <div className="flex items-center p-3 border-b border-slate-500 mx-auto w-full max-w-2xl text-xs">
        {post?.userId && (
          <img
            className="w-9 h-9 rounded-full bg-gray-200 mr-3"
            src={post.userId.profilePicture}
            alt={post.userId.userName}
            onClick={() => setShowModel(true)} // Open modal when profile picture is clicked
            style={{ cursor: 'pointer' }}
          />
        )}
        <div className="flex flex-col">
          <span
            className={
              post?.userId?.isAdmin
                ? "font-bold text-xs text-red-600 truncate"
                : post?.userId?.isModerator
                ? "font-bold text-xs text-violet-700 truncate"
                : "font-bold text-xs truncate"
            }
          >
            {post?.userId ? `@${post.userId.userName}` : `[Deleted]`}
          </span>
          <div className="flex space-x-2 text-gray-600 text-xs mt-1">
            <span>
              {post &&
                new Date(post.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                })}
            </span>
            <span className="italic">
              {post && (post.content.length / 1000).toFixed(0)} mins read
            </span>
          </div>
        </div>
      </div>
      <div
        className="
    p-3 max-w-2xl mx-auto w-full post-content prose prose-lg
    text-gray-700 dark:text-gray-300
    dark:prose-h1:text-gray-300
    dark:prose-h2:text-gray-300
    dark:prose-h3:text-gray-300
    dark:prose-h4:text-gray-300
    dark:prose-h5:text-gray-300
    dark:prose-h6:text-gray-300
    dark:prose-p:text-gray-300
    dark:prose-a:text-gray-300
    dark:prose-strong:text-gray-300
    dark:prose-em:text-gray-300
    dark:prose-u:text-gray-300
    dark:prose-s:text-gray-300
    dark:prose-ul:text-gray-300
    dark:prose-ol:text-gray-300
    dark:prose-li:text-gray-300
    dark:prose-blockquote:text-gray-300
    dark:prose-code:text-gray-300
    dark:prose-pre:text-gray-300
    dark:prose-img:text-gray-300
  "
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      ></div>

      <div className="max-w-4xl mx-auto w-full">
        <CallToAction />
      </div>

      <CommentSection postId={post._id} />

      <div className="flex flex-col justify-center items-center mb-5">
        <h1 className="text-xl mt-5">Recent Articles</h1>
        <div className="flex flex-wrap gap-5 mt-5 justify-center">
          {recentPosts &&
            recentPosts.map((post) => <PostCard key={post._id} post={post} />)}
        </div>
      </div>
      {/* Reusable UserProfileModal component */}
      <UserProfileModal
        show={showModel}
        onClose={() => setShowModel(false)}
        user={post.userId}
      />
    </main>
  );
}
