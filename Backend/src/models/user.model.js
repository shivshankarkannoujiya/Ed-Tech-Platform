import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

        confirmPassword: {
            type: String,
            required: true,
        },

        accountType: {
            type: String,
            enum: ["Admin", "Student", "Instructor"],
            required: true,
        },

        profileImage: {
            type: String,
            required: true,
        },

        token: {
            type: String,
        },

        resetPasswordExpires: {
            type: Date,
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

        courseProgress: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "CourseProgress",
            },
        ],
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
    try {
        return jwt.sign(
            {
                _id: this._id,
                email: this.email,
                accountType: this.accountType,
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );
    } catch (error) {
        console.log("Error while generating AccessToken", error);
    }
};

const User = mongoose.model("User", userSchema);
export { User };
