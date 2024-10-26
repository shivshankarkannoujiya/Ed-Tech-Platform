import { Course } from "../models/Course.model.js";
import { User } from "../models/user.model.js";
import { Tag } from "../models/tags.model.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { APiResponse } from "../utils/ApiResponse.js";

/*
TODO:
1. CreateCourse
2. getAllCourse
*/

const createCourse = asyncHandler(async (req, res) => {
    const { courseName, courseDescription, whatYouWillLearn, price, tag } =
        req.body;
    const thumbnail = req.files.thumbnailImage;

    // Validation
    if (
        [courseName, courseDescription, whatYouWillLearn, price, tag].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required !!");
    }

    if (!thumbnail) {
        throw new ApiError(400, "thumbnail is required !!");
    }

    //TODO: Check for instruction
    const userId = req.user._id; //? may occure error : use -> id instead _id
    const instructorDetails = await User.findById({ userId });
    console.log("InstructorDetails", instructorDetails);

    if (!instructorDetails) {
        throw new ApiError(404, "Instructor Details not found !!");
    }

    // Check given tag valid or not
    const tagDetails = await Tag.findById({ tag });
    if (!tagDetails) {
        throw new ApiError(404, "Tag details not found !!");
    }

    // upload image to Cloudinary
    const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
    );

    // create Entry in DB
    const newCourse = await Course.create({
        courseName,
        courseDescription,
        instructor: instructorDetails._id,
        whatYouWillLearn,
        price,
        tag: tagDetails._id,
        thumbnail: thumbnailImage?.secure_url,
    });

    // Add newCourse to the user Schema of Instructor
    await User.findByIdAndUpdate(
        { _id: instructorDetails._id },
        {
            $push: {
                courses: newCourse._id,
            },
        },
        { new: true }
    );

    // TODO: update tag Schema
    await Tag.findByIdAndUpdate(
        { _id: tagDetails._id },
        {
            $push: {
                course: newCourse._id,
            },
        }
    );

    return res
        .status(200)
        .json(200, newCourse, "Course Created Successfully !!");
});



export { createCourse };
