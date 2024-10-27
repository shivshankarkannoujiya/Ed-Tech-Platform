/*
TODO: Auth Controllers
1. sendOtp
2. SignUp
3. login
4. changePassword
*/

import { User } from "../models/user.model.js";
import OTP from "../models/otp.model.js";
import { Profile } from "../models/profile.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { APiResponse } from "../utils/ApiResponse.js";
import otpGenerator from "otp-generator";

const generateToken = async function (userId) {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();

        user.accessToken = accessToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken };
    } catch (error) {
        console.log("Error: ", error);
    }
};

//TODO: sendOTP
const sendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new ApiError(401, "User already exist with this email");
    }

    const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
    });
    console.log(`Generated OTP: ${otp}`);

    const isUniqueOtp = await OTP.findOne({ otp: otp });
    while (isUniqueOtp) {
        otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        isUniqueOtp = await OTP.findOne({ otp: otp });
    }

    const otpBody = await OTP.create({
        email,
        otp,
    });

    console.log(`OTP Body: ${otpBody}`);

    return res
        .status(200)
        .json(new APiResponse(200, otpBody, "OTP sent Successfully !!"));
});

// TODO: SignUp
const signUpUser = asyncHandler(async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        contactNumber,
        password,
        confirmPassword,
        accountType,
        otp,
    } = req.body;

    // Validation
    if (
        [
            firstName,
            lastName,
            email,
            contactNumber,
            password,
            confirmPassword,
            otp,
        ].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(403, "All fields are required");
    }

    // Match both passwords
    if (password !== confirmPassword) {
        throw new ApiError(400, "Password does not match !!");
    }

    // Check if User already Exist
    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new ApiError(400, "User is already registered !!");
    }

    // Send Most recent OTP
    const recentOTP = await OTP.find({ email })
        .sort({ createdAt: -1 })
        .limit(1);

    console.log("RecentOTP", recentOTP);

    if (recentOTP.length == 0) {
        throw new ApiError(400, "OTP not found !!");
    } else if (otp !== recentOTP.otp) {
        throw new ApiError(400, "Invalid OTP !!");
    }

    //TODO: profile
    /* 
        1. we have created fake profile, So,
        2. if we create profile then update kr denge 

        ?Agar fake profile nhi create krenge then we have to do,
            1. create profile 
            2. push the profile id into the User model
    */
    const profileDetatils = await Profile.create({
        gender: null,
        dateOfBirth: null,
        about: null,
        contactNumber: null,
    });

    const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password,
        confirmPassword,
        accountType,
        additionalDetatils: profileDetatils._id,
        profileImage: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    const createdUser = await User.findById(user._id).select("-password");
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering User");
    }

    return res
        .status(200)
        .json(
            new APiResponse(200, createdUser, "User Registered Successfully !!")
        );
});

const signInUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!(password && email)) {
        throw new ApiError(403, "All fields are required !!");
    }

    const user = User.findOne({ email });

    if (!user) {
        throw new ApiError(
            401,
            "User is not Registered, please SignUp first !!"
        );
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(
            400,
            "Passord is Invalid, Please Enter Valid Password !!"
        );
    }

    const { accessToken } = await generateToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password");

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .json(200, loggedInUser, "User loggedIn Successfully");
});

// TODO: ChangePassword

export { sendOTP, signUpUser, signInUser };
