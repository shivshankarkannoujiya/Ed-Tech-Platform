import mongoose from "mongoose";

const ratingAndReviews = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },

        rating: {
            type: Number,
            required: true,
        },

        review: {
            type: String,
            required: true,
        },

        course: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Course",
            index: true
        }
    },
    { timestamps: true }
);

const RatingAndReview = mongoose.model("RatingAndReview", ratingAndReviews);
export { RatingAndReview };
