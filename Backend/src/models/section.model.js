import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
    {
        sectionName: {
            type: String,
        },

        subSection: [
            {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "SubSection",
            },
        ],
    },
    { timestamps: true }
);

const Section = mongoose.model("Section", sectionSchema);
export { Section };
