import React from "react";
import { Navbar, TextInput, Button, Dropdown, Avatar, theme } from "flowbite-react";
import { Link, useLocation } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import { FaMoon,FaSun } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../redux/theme/themeSlice";
export default function Header() {
  // initialize dispatch to use the action
  const dispatch = useDispatch();
  // to get current user from redux toolkit
  const { currentUser } = useSelector((state) => state.user);
  const {theme}=useSelector((state)=>state.theme);
  console.log("current user", currentUser);
  // console.log(currentUser.profilePicture);
  // to active the path ie color effect when we on that page
  const path = useLocation().pathname;
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
      <form>
        <TextInput
          type="text"
          placeholder="Search..."
          rightIcon={AiOutlineSearch}
          className="hidden lg:inline"
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
          {theme==='light'?<FaSun/>:<FaMoon/>}
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
            <Dropdown.Item>Sign out</Dropdown.Item>
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
        <Navbar.Link active={path === "/projects"} as={"div"}>
          <Link to={"/projects"}>Projects</Link>
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}
