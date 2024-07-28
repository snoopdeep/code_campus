import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashSidbar from "../components/DashSidebar.jsx";
import DashProfile from "../components/DashProfile.jsx";
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
        {/* <DashProfile /> */}
      </div>
    </div>
  );
}
