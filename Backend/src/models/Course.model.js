import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
    {
        courseName: {
            type: String,
        },

        courseDescription: {
            type: String,
        },

        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        whatYouWillLearn: {
            type: String,
        },

        courseContent: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Section",
            },
        ],

        ratingAndReviews: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "RatingAndReview",
            },
        ],

        price: {
            type: Number,
        },

        thumbnail: {
            type: String,
        },

        tag: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tag",
        },

        studentsEnrolled: [
            {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "User",
            },
        ],

        instructions: {
            type: [String],
        },

        status: {
            type: String,
            enum: ["Draft", "Published"],
        },
    },
    { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);
export { Course };
