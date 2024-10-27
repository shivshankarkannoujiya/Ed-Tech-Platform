import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { APiResponse } from "../utils/ApiResponse.js";
import { SubSection } from "../models/subSection.model.js";
import { Section } from "../models/section.model.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";

const createSubSection = asyncHandler(async (req, res) => {
    const { sectionId, title, timeDuration, description } = req.body;

    const video = req.files.videoFile;

    if (
        [sectionId, title, timeDuration, description].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(404, "All fields are required !!");
    }

    if (!video) {
        throw new ApiError(404, "video file is required !!");
    }

    // upload video
    const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
    );

    // create new section
    const newSubSection = await SubSection.create({
        title,
        timeDuration,
        description,
        videoUrl: uploadDetails.secure_url,
    });

    // update Section by subSection id
    // TODO: populate updated Section(subSection) use: populate
    const updatedSection = await Section.findByIdAndUpdate(
        { _id: sectionId },
        {
            $push: {
                subSection: newSubSection._id,
            },
        },
        { new: true }
    );

    return res
        .status(200)
        .json(
            new APiResponse(
                200,
                updatedSection,
                "Subsection created successfully !!"
            )
        );
});

/*
TODO:
1. update subSection 
2. delete subSection
*/
export { createSubSection };
