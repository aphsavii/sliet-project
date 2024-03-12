import { asyncHandler } from "../utils/AsyncHandler";
import { ApiError } from "../utils/ApiError";
import  { jwt } from 'jsonwebtoken';
import { User } from "../models/user.model";

const verifyJwt = asyncHandler(
    async (req,next)=>{
        const accessToken = req?.cookies?.accessToken || req.header("Authorization").replace("Bearer ","");
        if(!accessToken) return new ApiError("Unauthorized request",401);

        const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
        const user = await User.findOne({regno:decodedToken?.regno}).select('-password -refreshtoken');
        if(!user) return new ApiError("Invalid access token",401);

        req.user=user;
        next();
    }
)
