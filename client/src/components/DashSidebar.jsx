import { Sidebar } from "flowbite-react";
import { HiUser, HiArrowSmRight, HiDocumentText, HiOutlineUsers, HiAnnotation, HiChartPie } from "react-icons/hi";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import React from "react";
import { signOutSuccess } from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

export default function DashSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const{ currentUser} = useSelector((state) => state.user);

  const [tab, setTab] = useState("");
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  });

  // handle signout
  const handleSignOut = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/users/signout", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signOutSuccess());
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Sidebar className="w-full md:w-56">
      <Sidebar.Items>
        <Sidebar.ItemGroup className="flex flex-col gap-1">
        {currentUser.isAdmin && (
            <Link to={"/dashboard?tab=dash"}>
              <Sidebar.Item
                active={tab === "dash"}
                icon={HiChartPie}
                as={"div"}
              >
                Dashboard
              </Sidebar.Item>
            </Link>
          )}
          <Link to={"/dashboard?tab=profile"}>
            <Sidebar.Item
              active={tab === "profile"}
              icon={HiUser}
              label={currentUser.isAdmin ? "Admin" : "User"}
              labelColor="dark"
              as={"div"}
            >
              Profile
            </Sidebar.Item>
          </Link>
          {currentUser && (
            <Link to={"/dashboard?tab=posts"}>
              <Sidebar.Item
                active={tab === "posts"}
                icon={HiDocumentText}
                as={"div"}
              >
                Posts
              </Sidebar.Item>
            </Link>
          )}
          {currentUser.isAdmin && (
            <Link to={"/dashboard?tab=users"}>
              <Sidebar.Item
                active={tab === "users"}
                icon={HiOutlineUsers}
                as={"div"}
              >
                Users
              </Sidebar.Item>
            </Link>
          )}
          {currentUser.isAdmin && (
            <Link to={"/dashboard?tab=comments"}>
              <Sidebar.Item
                active={tab === "comments"}
                icon={HiAnnotation}
                as={"div"}
              >
                Comments
              </Sidebar.Item>
            </Link>
          )}

          <Sidebar.Item
            icon={HiArrowSmRight}
            className="cursor-pointer"
            onClick={handleSignOut}
          >
            Sign Out
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}
