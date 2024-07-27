import express from "express";
const router = express.Router();
import testRouter from "../controllers/user.controller.js";
console.log("Hello from user route!!");
router.get("/test", testRouter);

export default router;
