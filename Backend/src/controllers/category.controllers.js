import { Category } from "../models/category.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { APiResponse } from "../utils/ApiResponse.js";



const createCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    if (!name) {
        throw new ApiError(
            400,
            "All fields are required"
        )
    }

    const categoryDetails = await Category.create({
        name,
        description
    })
    console.log(categoryDetails);

    return res
        .status(200)
        .json(
            new APiResponse(
                200,
                categoryDetails,
                "Category Created Successfully"
            )
        )
})


const getAllCategory = asyncHandler(async (_, res) => {
    const allCategories = await Category.find()
    return res
        .status(200)
        .json(
            new APiResponse(
                200,
                allCategories,
                "fetched all Categories Successfully"
            )
        )
})

const categoryPageDetails = asyncHandler(async (req, res) => {
    /**
     * get categoryId
     * get courses for specified categoryId
     * Validation
     * get courses for different categories
     * get top selling courses
     * return respponse
     */

    const { categoryId } = req.body
    const selectedCategory = await Category.findById(courseId)
        .populate("courses")
        .exec()

    if (!selectedCategory) {
        throw new ApiError(
            404,
            "Data Not found"
        )
    }

    const differentCategories = await Category.find(
        {
            _id: { $ne: categoryId }
        }
            .populate("courses")
            .exec()
    )

    // TODO: get top selling courses

    return res
        .status(200)
        .json(
            new APiResponse(
                200,
                {
                    selectedCategory,
                    differentCategories
                },

            )
        )

})

export { createCategory, getAllCategory, categoryPageDetails }
