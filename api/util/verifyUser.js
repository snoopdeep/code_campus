import jwt from 'jsonwebtoken';
import { errorHandler } from '../util/error.js';


export const verifyToken=async(req, res,next)=> {
    // get the cookie from the request using cookie-parser
    // console.log(req.cookies);
    console.log('hi from verifyToken');
    console.log('req.cookies',req.cookies);
    const token=req.cookies.access_token; // access_token is the name of the cookie
    console.log(token);
    // verify the token
    jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
        console.log('hello from verifyUser controller, this is user: ',user);
      if(err){
        return next(errorHandler(401,"Unauthorized"));
      }
      req.user=user;
    //   console.log(req);
      next();
  
    }
  )
  }