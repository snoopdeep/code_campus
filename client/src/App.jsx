import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// importing all the components
import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Project from "./pages/Project";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CreatePost from "./pages/CreatePost";
import PrivateAdminRoute from "./components/PrivateAdminRoute.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import UpdatePost from "./pages/UpdatePost.jsx";
import PostPage from "./pages/PostPage";
import ScrollToTop from "./components/ScrollToTop";
import Search from "./pages/Search.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Feedback from "./pages/Feedback.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      {/* /* // Adding Header component to all the pages */}
      <Header />
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/about" element={<About />}></Route>
        {/* // protect the dashboard route using private route */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />}></Route>
        </Route>
        {/* <Route element={<PrivateAdminRoute />}> */}
          <Route path="/create-post" element={<CreatePost />}></Route>
          <Route path="/update-post/:postId" element={<UpdatePost />}></Route>
          <Route path="/feedback" element={<Feedback/>}></Route>
        {/* </Route> */}

        <Route path="/sign-in" element={<SignIn />}></Route>
        <Route path="/sign-up" element={<SignUp />}></Route>
        <Route path="/forgot-password" element={<ForgotPassword />}></Route>
        <Route path="/reset-password/:resetToken" element={<ResetPassword/>}></Route>
        <Route path="/search" element={<Search />} />
        <Route path="/projects" element={<Project />}></Route>
        <Route path="/post/:postSlug" element={<PostPage />}></Route>
      </Routes>
      {/* /* // Adding footer component to all the pages */}
      <Footer />
    </BrowserRouter>
  );
}
