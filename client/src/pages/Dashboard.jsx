import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashSidbar from "../components/DashSidebar.jsx";
import DashProfile from "../components/DashProfile.jsx";
import DashPosts from "../components/DashPosts.jsx";
import DashUsers from "../components/DashUsers.jsx";
import DashComments from "../components/DashComments.jsx"
import React from "react";

export default function Dashboard() {
  const location = useLocation();
  // console.log("location", location);
  const [tab, setTab] = useState("");
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    // console.log(urlParams);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
    // console.log(tabFromUrl);
  });
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="md:w-56">
        <DashSidbar />
      </div>
      {/* Profile */}
      <div className="flex-1 flex justify-center items-center">
        {/* // show profile only when tab is profile */}
        {tab === "profile" && <DashProfile />}
        {/* show posts only when tab is posts */}
        {tab === "posts" && <DashPosts/>}
        {/* // import DashUsers from "../components/DashUsers.jsx";
        // show users only when tab is users */}
        {tab === "users" && <DashUsers/>}
        {/* Comments */}
        {tab==="comments"&&<DashComments/>}
      </div>
    </div>
  );
}
