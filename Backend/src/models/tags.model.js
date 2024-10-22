import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },

        description: {
            type: String,
        },

        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        },
    },
    { timestamps: true }
);

const Tag = mongoose.model("Tag", tagSchema);
export { Tag };
