import React, { useEffect, useState } from "react";
import { Navbar, TextInput, Button, Dropdown, Avatar } from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import { FaMoon, FaSun, FaBars, FaTimes } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../redux/theme/themeSlice";
import { signOutSuccess } from "../redux/user/userSlice";

export default function Header() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const path = useLocation().pathname;

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromURL = urlParams.get("searchTerm");
    if (searchTermFromURL) setSearchTerm(searchTermFromURL);
  }, [location]);

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
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("searchTerm", searchTerm);
    const searchQ = urlParams.toString();
    navigate(`/search?${searchQ}`);
    setIsSearchOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <Navbar className="border-b-2 relative">
      {/* <Link
        to={"/"}
        className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white"
      >
        <span className="py-1 text-2xl rounded-lg dark:text-white">ace</span>
        <span className="text-blue-500 mx-1">Connect</span>
      </Link> */}

<Link
  to="/"
  className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white flex items-center"
>
  <img src="/pen.png"></img>
  <span className="py-1 text-2xl font-ace dark:text-white tracking-wide">
    ace
  </span>
  <span className="text-blue-500 text-2xl font-connect font-bold ml-0">
    Connect
  </span>
</Link>


      {/* Mobile Search Toggle */}
      <div className="flex items-center lg:hidden">
        <Button
          className="w-12 h-10 mr-2"
          color={"gray"}
          pill
          onClick={toggleSearch}
        >
          {isSearchOpen ? <FaTimes /> : <AiOutlineSearch />}
        </Button>
        <Navbar.Toggle />
      </div>

      <div className="flex gap-2 md:order-2">
        {/* Desktop Search */}
        <form onSubmit={handleSubmit} className="hidden lg:block">
          <TextInput
            type="text"
            placeholder="Search..."
            rightIcon={AiOutlineSearch}
            className="w-40"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        {/* Mobile Search Dropdown */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 w-full p-2 bg-white dark:bg-gray-800 lg:hidden z-50">
            <form onSubmit={handleSubmit} className="w-full">
              <TextInput
                type="text"
                placeholder="Search..."
                rightIcon={AiOutlineSearch}
                className="w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
          </div>
        )}

        {/* Theme Toggle */}
        <Button
          className="w-12 h-10 hidden sm:inline "
          color={"gray"}
          pill
          onClick={() => dispatch(toggleTheme())}
        >
          {theme === "light" ? <FaSun /> : <FaMoon />}
        </Button>

        {/* User Dropdown */}
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
              <span
                className={
                  currentUser.isAdmin
                    ? "block text-sm text-red-600"
                    : currentUser.isModerator
                    ? "block text-sm text-violet-600"
                    : "block text-sm"
                }
              >
                @{currentUser.userName}
              </span>
              <span
                className={
                  currentUser.isAdmin
                    ? "block text-sm text-red-600 font-medium truncate"
                    : currentUser.isModerator
                    ? "block text-sm text-violet-600 font-medium truncate"
                    : "block text-sm font-medium truncate"
                }
              >
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
      </div>

      {/* Mobile Navbar Collapse (existing structure) */}
      <Navbar.Collapse>
        <Navbar.Link active={path === "/"} as={"div"}>
          <Link to={"/"}>Home</Link>
        </Navbar.Link>
        <Navbar.Link active={path === "/about"} as={"div"}>
          <Link to={"/about"}>About</Link>
        </Navbar.Link>
        {currentUser ? (
          <Navbar.Link active={path === "/feedback"} as={"div"}>
            <Link to={"/feedback"}>Feedback</Link>
          </Navbar.Link>
        ) : (
          <Navbar.Link active={path === "/sign-in"} as={"div"}>
            <Link to={"/sign-in"}>Feedback</Link>
          </Navbar.Link>
        )}
        {/* Theme Toggle for Mobile */}
        <Navbar.Link as={"div"} className="lg:hidden">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => dispatch(toggleTheme())}
          >
            {theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            <span className="ml-2">
              {theme === "light" ? <FaSun /> : <FaMoon />}
            </span>
          </div>
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}
