import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { APiResponse } from "../utils/ApiResponse.js";
import { Course } from "../models/Course.model.js";
import { User } from "../models/user.model.js";
import { mailSender } from "../utils/mailSender.js";
import { instance } from "../config/razorPay.js";
import Razorpay from "razorpay";

//TODO: Capture the Payment and initiate the RazorPay Order
const capturePayment = asyncHandler(async (req, res) => {
    // get courseId and userId
    const { courseId } = req.body;
    const userId = req.user._id;

    // Validation courseId and Course level
    if (!courseId) {
        throw new ApiError(400, "Please provide valid courseId");
    }

    const course = await Course.findById(courseId);
    if (!course) {
        throw new ApiError(404, "Could not find Course");
    }

    // check user already paid for same Course
    if (course.studentsEnrolled.includes(userId)) {
        throw new ApiError(400, "Student is already Enrolled");
    }

    // create Order
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount: amount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes: {
            courseId,
            userId,
        },
    };

    // initiate the payment using Razorpay
    const paymentResponse = await instance.orders.create(options);
    console.log("paymentResponse", paymentResponse);

    if (!paymentResponse || paymentResponse === undefined) {
        throw new ApiError(400, "Could not initiate Order");
    }

    return res.status(200).json(
        new APiResponse(
            200,
            {
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                thumbnail: course.thumbnail,
                orderId: paymentResponse.id,
                currency: paymentResponse.currency,
                amount: paymentResponse.amount,
            },
            "Order created Successfully !!"
        )
    );
});

const verifySignature = asyncHandler(async (req, res) => {
    const webhookSecret = "1234xyz";
    const signature = req.headers["x-razorpay-signature"];

    const shaSum = crypto.createHmac("sha256", webhookSecret); // 1
    shaSum.update(JSON.stringify(req.body)); // 2
    const digest = shaSum.digest("hex"); // 3

    if (!(signature === digest)) {
        throw new ApiError(400, "Payment is not Authorized");
    }

    /*
        if => Authorized
        TODO:
        Action: Enroll the Student in Course
            1. User -> courses -> ObjectId(particular course)
            2. Course -> studentEnrolled -> usedId(Object Id)
    */

    const { courseId, userId } = req.body.payload.payment.entity.notes;

    //TODO:
    // Action: find the course and enroll the student in it.
    const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
    );

    if (!enrolledCourse) {
        throw new ApiError(500, "Course Not found !!");
    }
    console.log(enrolledCourse);

    // TODO:
    // find the student and add the course in their enrolledCourse
    const enrrolledStudent = await User.findOneAndUpdate(
        { _id: userId },
        { $push: { courses: courseId } },
        { new: true }
    );

    if (!enrrolledStudent) {
        throw new ApiError(500, "Student not found !!");
    }

    // TODO:
    // sendMail of enrollement
    // Attach template
    const emailResponse = await mailSender(
        enrrolledStudent.email,
        "Congratulation from ed-Tech",
        "Congratulation you are onboarded into new ed-Tech Course"
    );
    console.log("emailResponse", emailResponse);

    return res
        .status(200)
        .json(
            new APiResponse(
                200,
                "Signature verified and course Added Successfully !!"
            )
        );
});

export { capturePayment, verifySignature };
