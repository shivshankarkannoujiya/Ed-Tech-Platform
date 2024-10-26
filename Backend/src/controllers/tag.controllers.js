import { Tag } from "../models/tags.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { APiResponse } from "../utils/ApiResponse.js";

const createTag = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        throw new ApiError(400, "All fields are required !!");
    }

    const tagDetails = await Tag.create({
        name,
        description,
    });
    console.log("tagDetails: ", tagDetails);

    return res
        .status(201)
        .json(new APiResponse(201, tagDetails, "Tag created Successfully !!"));
});

const getAllTags = asyncHandler(async (_, res) => {
    const allTags = await Tag.find({}, { name: true, description: true });
    return res
        .status(200)
        .json(
            new APiResponse(200, allTags, "All tags fetched successfully !! ")
        );
});

export { createTag, getAllTags };
