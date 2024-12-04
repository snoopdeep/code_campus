export const errorHandler=(statusCode,message)=>{
    const error=new Error();
    error.statusCode=statusCode||500;
    error.message=message||"Internal Server Error";
    console.log("This is error Handler :: ",error);
    return error;;
}