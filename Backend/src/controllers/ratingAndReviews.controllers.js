import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { APiResponse } from "../utils/ApiResponse.js";
import { Course } from "../models/Course.model.js";
import { RatingAndReview } from "../models/ratingAndReview.model.js";

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
    await Course.findByIdAndUpdate({ _id: courseId },
        {
            $push: {
                ratingAndReviews: ratingReview._id
            }
        },
        { new: true }
    )


})


export { createRating }
