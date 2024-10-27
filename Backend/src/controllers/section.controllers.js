import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { APiResponse } from "../utils/ApiResponse.js";
import { Section } from "../models/section.model.js";
import { Course } from "../models/Course.model.js";

// TODO: Create Section
const createSection = asyncHandler(async (req, res) => {
    const { sectionName, courseId } = req.body;

    if (!sectionName || !courseId) {
        throw new ApiError(400, "All fields required !!");
    }

    const newSection = await Section.create({
        sectionName,
    });

    // ? how can we populate section as well as sub-section
    const updatedCourseDetails = await Course.findByIdAndUpdate(
        { courseId },
        {
            $push: {
                courseContent: newSection._id,
            },
        },

        { new: true }
    );

    return res
        .status(200)
        .json(
            new APiResponse(
                200,
                updatedCourseDetails,
                "Section created Successfully !!"
            )
        );
});

const updateSection = asyncHandler(async (req, res) => {
    const { sectionName, sectionId } = req.body;

    if (!sectionName || !sectionId) {
        throw new ApiError(400, "All fields are required !!");
    }

    const updatedSection = await Section.findByIdAndUpdate(
        { sectionId },
        {
            $push: {
                sectionName: sectionName,
            },
        },

        { new: true }
    );

    return res
        .status(200)
        .json(200, updatedSection, "Section updated Successfully !!");
});

const deleteSection = asyncHandler(async (req, res) => {
    // get id: Assuming that we are sending the id into the params
    const { sectionId } = req.params;

    if (!sectionId) {
        throw new ApiError(400, "sectionId is required !!");
    }
    const deleteSection = await Section.findByIdAndDelete({ sectionId });

    return res
        .status(200)
        .json(
            new APiResponse(
                200,
                deleteSection,
                "Section Deleted Successfully !!"
            )
        );
});

export { createSection, updateSection, deleteSection };
