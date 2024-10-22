import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDB } from "./config/db.js";

dotenv.config({
    path: "./.env",
});

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log(`ERROR: ${error}`);
            process.exit(1);
        });

        app.listen(process.env.PORT, () => {
            console.log(`Server is listening at: ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.log(`MongoDB connection Failed, ERROR: ${error}`);
        process.exit(1);
    });
