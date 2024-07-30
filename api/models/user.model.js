import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  // schema fields or definition
  {
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture:{
    type: String,
    default: "https://rb.gy/sck637",
  },
  isAdmin:{
    type: Boolean,
    default: false,
  }
},
// schema options
{
  timestamps: true,
});

const User=mongoose.model("User",userSchema);

export default User;    