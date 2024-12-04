import mongoose from "mongoose";

// User schema definition
const userSchema = new mongoose.Schema(
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
    profilePicture: {
      type: String,
      default:
        "https://isobarscience-1bfd8.kxcdn.com/wp-content/uploads/2020/09/default-profile-picture1.jpg",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isDeleted:{
      type:Boolean,
      default:false,
    },
    // OTP related fields
    otp: {
      type: String, // Store OTP
    },
    otpExpiry: {
      type: Date, // Store OTP expiry time
    },
    isVerified: {
      type: Boolean,
      default: false, // Flag to mark if the user is verified via OTP
    },
  },
  {
    timestamps: true, // To track creation and modification times
  }
);

const User = mongoose.model("User", userSchema);

export default User;
