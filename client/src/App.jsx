import React from 'react'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
// importing all the components
import Home from './pages/Home'
import About from './pages/About'
import Dashboard from './pages/Dashboard'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Project from './pages/Project'
import Header from './components/Header'
import Footer from './components/Footer'
import PrivateRoute from "./components/PrivateRoute.jsx";


export default function App() {
  return (
    <BrowserRouter>
    {/* /* // Adding Header component to all the pages */ }
    <Header/>
    <Routes>
      <Route path='/' element={<Home/>}></Route>
      <Route path='/about' element={<About/>}></Route>
      {/* // protect the dashboard route using private route */}
      <Route element={<PrivateRoute/>}>
      <Route path='/dashboard' element={<Dashboard/>}></Route>
      </Route>
      <Route path='/sign-in' element={<SignIn/>}></Route>
      <Route path='/sign-up' element={<SignUp/>}></Route>
      <Route path='/projects' element={<Project/>}></Route>
    </Routes>
       {/* /* // Adding footer component to all the pages */ }
    <Footer/>

    </BrowserRouter>
  )
}
