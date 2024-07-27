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

export default function App() {
  return (
    <BrowserRouter>
    {/* /* // Adding Header component to all the pages */ }
    <Header/>
    <Routes>
      <Route path='/' element={<Home/>}></Route>
      <Route path='/about' element={<About/>}></Route>
      <Route path='/dashboard' element={<Dashboard/>}></Route>
      <Route path='/sign-in' element={<SignIn/>}></Route>
      <Route path='/sign-up' element={<SignUp/>}></Route>
      <Route path='/projects' element={<Project/>}></Route>
    </Routes>
       {/* /* // Adding footer component to all the pages */ }
    <Footer/>

    </BrowserRouter>
  )
}
