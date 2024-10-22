import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true,
        },

        contactNumber: {
            type: Number,
            required: true,
        },

        accountType: {
            type: String,
            enum: ["Admin", "Student", "Instructor"],
            required: true,
        },

        additionalDetatils: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Profile",
        },

        courses: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        },

        profileImage: {
            type: String,
            required: true,
        },

        courseProgress: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "CourseProgress",
            },
        ],
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export { User };
