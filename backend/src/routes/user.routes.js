import { Router } from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { registerUser,
         loginUser,
         generateOTP,
         logoutUser,
} from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.route('/register').post( 
    upload.fields([
    {
        name: "avatar",
        maxCount: 1
    }, 
    {
        name: "coverImage",
        maxCount: 1
    }
]),registerUser);

userRouter.route('/generateOTP').post(generateOTP);
userRouter.route('/login').post(loginUser);
userRouter.route('/logout').post(logoutUser);


export {userRouter}