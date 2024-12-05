import React, { useEffect, useState } from "react";
import {
  Navbar,
  TextInput,
  Button,
  Dropdown,
  Avatar,
  theme,
} from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import { FaMoon, FaSun } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../redux/theme/themeSlice";
import { signOutSuccess } from "../redux/user/userSlice";
export default function Header() {
  // initialize dispatch to use the action
  const dispatch = useDispatch();
  // to get current user from redux toolkit
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  // console.log("current user", currentUser);
  // console.log(currentUser.profilePicture);
  // to active the path ie color effect when we on that page
  const path = useLocation().pathname;

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTemFromURL = urlParams.get("searchTerm");
    if (searchTemFromURL) setSearchTerm(searchTemFromURL);
  }, [location]);
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
  const handleSubmit = (e) => {
    console.log("hii", e);
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("searchTerm", searchTerm);
    const searchQ = urlParams.toString();
    navigate(`/search?${searchQ}`);
  };
  return (
    <Navbar className="border-b-2">
      <Link
        to={"/"}
        className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white"
      >
        <span className="px-2 py-1 bg-gradient-to-r from-orange-500 via-white-500 to-green-500 rounded-lg text-white">
          code
        </span>
        Campus
      </Link>
      <form onSubmit={handleSubmit}>
        <TextInput
          type="text"
          placeholder="Search..."
          rightIcon={AiOutlineSearch}
          className="hidden lg:inline"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>
      <Button className="w-12 h-10 lg:hidden" color={"gray"} pill>
        <AiOutlineSearch></AiOutlineSearch>
      </Button>
      <div className="flex gap-2 md:order-2">
        <Button
          className="w-12 h-10 hidden sm:inline"
          color={"gray"}
          pill
          onClick={() => dispatch(toggleTheme())}
        >
          {/* // if theme is light then show sun icon else moon icon */}
          {theme === "light" ? <FaSun /> : <FaMoon />}
          {/* <FaMoon /> */}
        </Button>
        {/* // if user is logged in then show them the dropdown+ avatar else sign in button */}
        {currentUser ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt="user"
                img={currentUser.profilePicture}
                rounded
              ></Avatar>
            }
          >
            <Dropdown.Header>
              <span className="block text-sm">@{currentUser.name}</span>
              <span className="block text-sm font-medium truncate">
                @{currentUser.email}
              </span>
            </Dropdown.Header>
            <Link to={"/dashboard?tab=profile"}>
              <Dropdown.Item>Profile</Dropdown.Item>
            </Link>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleSignOut}>Sign out</Dropdown.Item>
          </Dropdown>
        ) : (
          <Link to={"/sign-in"}>
            <Button gradientDuoTone="purpleToBlue" className="" outline>
              Sign In
            </Button>
          </Link>
        )}

        <Navbar.Toggle></Navbar.Toggle>
      </div>
      <Navbar.Collapse>
        <Navbar.Link active={path === "/"} as={"div"}>
          <Link to={"/"}>Home</Link>
        </Navbar.Link>
        <Navbar.Link active={path === "/about"} as={"div"}>
          <Link to={"/about"}>About</Link>
        </Navbar.Link>
        {currentUser ?
          (<Navbar.Link active={path === "/feedback"} as={"div"}>
            <Link to={"/feedback"}>Feedback</Link>
          </Navbar.Link>):(
            <Navbar.Link active={path === "/sing-in"} as={"div"}>
              <Link to={"/sign-in"}>Feedback</Link>
            </Navbar.Link>
          )}
      </Navbar.Collapse>
    </Navbar>
  );
}
