/*
TODO: auth middlewares
1. auth
2. isStudent
3. isInstructor
4. isAdmin
*/

import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//TODO: Authentication Middleware
const authMiddleware = asyncHandler(async (req, _, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization").replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized Access, Token is Missing");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log(`DecodedToken`, decodedToken);
    const user = await User.findById(decodedToken?._id).select("-password");

    if (!user) {
        throw new ApiError(401, "Invalid AccessToken");
    }

    req.user = decodedToken;
    next();
});

//TODO: Authorization Middleware
const isStudent = asyncHandler(async (req, _, next) => {
    if (req.user.accountType !== "Student") {
        throw new ApiError(401, "This is protected Route for Student Only");
    }
    next();
});

const isInstructor = asyncHandler(async (req, _, next) => {
    if (req.user.accountType !== "Instructor") {
        throw new ApiError(401, "This is protected route for Instrucctor");
    }
    next();
});

const isAdmin = asyncHandler(async (req, _, next) => {
    if (req.user.accountType !== "Admin") {
        throw new ApiError(401, "This is protected route for Admin");
    }

    next();
});

export { authMiddleware, isStudent, isInstructor, isAdmin };
