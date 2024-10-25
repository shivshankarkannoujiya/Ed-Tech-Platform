import mongoose from "mongoose";
import { mailSender } from "../utils/mailSender.js";

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },

        otp: {
            type: String,
            required: true,
        },

        createdAt: {
            type: Date,
            default: Date.now(),
            expires: 5 * 60,
        },
    },
    { timestamps: true }
);

// TODO: function to send Email
async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(
            email,
            "Verification email from ed-Tech",
            otp
        );
        console.log(`Verification mail send Successfully, ${mailResponse}`);
    } catch (error) {
        console.log(`ERR while sending verification Email: ${error}`);
    }
}

otpSchema.pre("save", async function (next) {
    await sendVerificationEmail(this.email, this.otp);
    next();
});

const OTP = mongoose.model("OTP", otpSchema);
export { OTP };
