/*
TODO: Reset password Controllers
1. resetPasswordToken
2. resetPassword
*/

import { User } from "../models/user.model.js";
import { mailSender } from "../utils/mailSender.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { APiResponse } from "../utils/ApiResponse.js";

// TODO: resetPasswordToken
const resetPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "Your email is not registered with Us !!");
    }

    // generate Token
    const token = crypto.randomUUID();

    // update user by adding token and expiration time
    const updatedUserDetails = await findOne(
        { email },
        {
            token: token,
            resetPasswordExpires: Date.now() + 5 * 60 * 1000,
        },

        { new: true }
    );

    // createURL
    const url = `http://localhost:3000/update-password/${token}`;

    // send mail containing url
    await mailSender(
        email,
        "password reset link",
        `Password Reset Link: ${url}`
    );

    return res
        .status(200)
        .json(
            new APiResponse(
                200,
                updatedUserDetails,
                "Reset mail sent Successfuully, please check email and reset password"
            )
        );
});

const resetPassword = asyncHandler(async (req, res) => {
    /*
    1. const url = `http://localhost:3000/update-password/${token}`;
        !1. As we are sending token in url 
        !2. We can fetch it from the params
    ?2. How it will come into body
        !1. frontend will send 
            password, confirmPassword and token into the body
        !So, we are fetching from the body
    */

    const { password, confirmPassword, token } = req.body;
    if (password !== confirmPassword) {
        throw new ApiError(400, "Password not matching");
    }

    // token invalid case
    const userDetails = await User.findOne({ token });
    if (!userDetails) {
        throw new ApiError(401, "Token Invalid");
    }

    if (userDetails.resetPasswordExpires < Date.now()) {
        throw new ApiError(401, "Token is Expired, please regenerate token");
    }

    // hash Password
    // we are using in model

    // Update password
    await User.findOneAndUpdate(
        { token },
        {
            password: password,
        },

        { new: true }
    );

    return res
        .status(200)
        .json(new APiResponse(200, "Password Reset Successfully !!"));
});

export { resetPasswordToken, resetPassword };
