import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { APiResponse } from "../utils/ApiResponse.js";
import { Course } from "../models/Course.model.js";
import { RatingAndReview } from "../models/ratingAndReview.model.js";
import mongoose from "mongoose";

/**
 * Creating Rating 
 * Avg Rating 
 * getAll Rating
 */

const createRating = asyncHandler(async (req, res) => {

    /**
     * get User id 
     * fetch data from req.body
     * Check if user is enrolled or not 
     * Check if User is already reviewed 
     * Create Rating and review
     * Update Course with the Rating and review 
     * Return Response 
     */

    const userId = req.user.id
    const { rating, review, courseId } = req.body

    const courseDetails = await Course.findOne(
        { _id: courseId, studentsEnrolled: { $ememMatch: { $eq: userId } } },
    )

    if (!courseDetails) {
        throw new ApiError(
            404,
            "Student is not enolled in the Course"
        )
    }

    const alreadyReviewed = await RatingAndReview.findOne({
        user: userId,
        course: courseId
    })

    if (alreadyReviewed) {
        throw new ApiError(
            403,
            "Course id already reviewed by the User"
        )
    }


    // Create
    const ratingReview = await RatingAndReview.create({
        rating,
        review,
        course: courseId,
        user: userId
    })

    // update in Course
    const updatedCourseDetails = await Course.findByIdAndUpdate({ _id: courseId },
        {
            $push: {
                ratingAndReviews: ratingReview._id
            }
        },
        { new: true }
    )

    console.log(updatedCourseDetails);


    return res
        .status(200)
        .json(
            new APiResponse(
                200,
                ratingReview,
                "Rating and Review Created Successfully"
            )
        )

})

const getAverageRating = asyncHandler(async (req, res) => {
    /**
     * get Course Id
     * Calculate Avg Rating 
     * Return Rating 
     */

    const { courseId } = req.body

    const result = await RatingAndReview.aggregate([
        {
            $match: {
                course: new mongoose.Types.ObjectId(courseId)
            }
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: "$rating" }
            }
        }
    ])

    if (result.length > 0) {
        return res
            .status(200)
            .json(
                200,
                {
                    averageRating: result[0].averageRating
                }
            )
    }

    // if not rating/review Exist
    return res
        .status(200)
        .json(
            200,
            {
                averageRating: 0,
            },
            "Average Rating is 0, No rating given till now"
        )
})

const getAllRating = asyncHandler(async (_, res) => {
    const allRating = await RatingAndReview.find({})
        .sort({ rating: "desc" })
        .populate({
            path: "user",
            select: "firstName lastName email image"
        })
        .populate({
            path: "course",
            select: "courseName"
        })
        .exec()

    return res
        .status(200)
        .json(
            200,
            allRating,
            "all Rating and reviews fetched Successfully"
        )
})

export { createRating, getAverageRating, getAllRating }
