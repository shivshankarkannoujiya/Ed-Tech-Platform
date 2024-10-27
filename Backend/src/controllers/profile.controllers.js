import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { APiResponse } from "../utils/ApiResponse.js";
import { Profile } from "../models/profile.model.js";
import { User } from "../models/user.model.js";

const updateProfile = asyncHandler(async (req, res) => {
    const { dateOfBirth, about, contactNumber, gender } = req.body;
    const userId = req.user._id; // sending in the authMiddleware

    if (!contactNumber || !gender || !userId) {
        throw new ApiError(400, "All fields are required !!");
    }

    /*
    1. we don't have any profileId
    2. userId: we can get the userDetails
    3. we can get profileId inside the userDetails
    */

    const userDetails = await User.findById(id);
    const profileId = userDetails.additionalDetatils;

    // profile details
    const profileDetatils = await Profile.findById(profileId);

    // update profile
    profileDetatils.dateOfBirth = dateOfBirth;
    profileDetatils.about = about;
    profileDetatils.contactNumber = contactNumber;
    profileDetatils.gender = gender;

    // save
    await profileDetatils.save();

    return res
        .status(200)
        .json(
            new APiResponse(
                200,
                profileDetatils,
                "Profile updated Successfully !!"
            )
        );
});

const deleteAccount = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const userDetails = await User.findById(userId);

    if (!userDetails) {
        throw new ApiError(404, "User not found !!");
    }

    // delete profile
    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetatils });

    // delete User
    await User.findByIdAndDelete({ _id: userId });

    // TODO: Also unEnroll User form the ENrolled Courses
    // TODO: How can we schedule job(task)[deletion Account] to account deletion: <cronJob>
    return res
        .status(200)
        .json(new APiResponse(200, "User Account deleted Successfully !!"));
});

const getUserDetails = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const loggedInUser = await User.findById(userId);
    if (!loggedInUser) {
        throw new ApiError(404, "Can not found User !!");
    }

    const userDetails = await User.findById(userId)
        .populate("additionalDetatils")
        .exec();

    return res
        .status(200)
        .json(new APiResponse(200, userDetails, "Fetched all user details"));
});

export { updateProfile, deleteAccount, getUserDetails };
