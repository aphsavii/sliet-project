import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { DEFAULT_AVATAR } from "../constants.js";
import { uploadOnCloudinary } from "../utils/uploadOnCloudinary.js";
import { redisClient, verifyOTP } from "../connections/redisConnect.js";
import { sendMail } from "../utils/sendMail.js";
import jwt from "jsonwebtoken";

// REGISTER USER CONTROLLER
const registerUser = asyncHandler(async (req, res, next) => {
  // get user details from frontend as wwell as otp
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res
  const { regno, email, fullName, programme, batch, trade, password, otp } = req.body;

  if (
    [regno, email, fullName, programme, batch, trade, password,otp].some(
      (field) => {
        let temp = field ?? "";
        return temp === "";
      }
    )
  ) {
    return res
      .status(400)
      .json(
        new ApiError(
          "regno, email, fullName, programme, batch, trade,password, otp are mandatory",
          400
        )
      );
  }

  // veryfying otp
  if(!otp) return res.status(401).json(newApiError("OTP is mandoatory",400,['Invalid OTP']));
  else{
   const verified =  await verifyOTP(otp,email);
   if(!verified) return res.status(401).json(new ApiError("Invalid OTP",401,['Invalid OTP']));
  }

  const registeredUser = await User.findOne({
    $or: [{ regno }, { email }],
  });

  if (registeredUser)
    return res.status(401).json(new ApiError("user already registered", 400));

  let localAvatarUrl;
  let avatarUrl = DEFAULT_AVATAR;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    localAvatarUrl = req.files.avatar[0]?.path;
    const upload = await uploadOnCloudinary(localAvatarUrl, "/avatar");
    if (!upload)
      return res
        .status(500)
        .json(
          new ApiError("Internal Server Error", 500, ["ERROR UPLOADING AVATAR"])
        );
    else avatarUrl = upload;
  }

  const user = await User.create({
    regno,
    fullName,
    email,
    programme,
    batch,
    trade,
    avatarUrl,
    password,
  });

  if (!user)
    return  res.status(500).json(new ApiError("Internal Server Error", 500, [
      "Somethig went wrong while registering user",
    ]));
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  return res
    .status(201)
    .json(new ApiResponse(200, "User Registered successfully", createdUser));
});


// GENERATE OTP CONTROLLER
const generateOTP = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email)
    return res
      .status(400)
      .json(new ApiResponse(400, "Name and Email are mandatory"));

  // OTP GENERATION
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10);
  }

  // SAVE OTP IN REDIS
  const setOTP = await redisClient.set(
    `otp:${email}`,
    otp,
    { EX: 120 },
    (err, reply) => {
      if (!reply)
        return res
          .status(500)
          .json(
            new ApiResponse(500, "Internal Server Error", [
              "Error saving OTP to redis",
            ])
          );
    }
  );

  // SEND OTP TO EMAIL
  const mail = await sendMail(
    email,
    "OTP from Registration from SlietAllInOne",
    `Hey ${name}, Your OTP for registration is ${otp}`
  );
  if (!mail)
    return res
      .status(500)
      .json(
        new ApiResponse(500, "Internal Server Error", [
          "Error sending OTP to email",
        ])
      );

  res
    .status(200)
    .json(new ApiResponse(200, "OTP generated successfully"));
});



// LOGIN USER CONTROLLER
const loginUser = asyncHandler(async (req, res) => { 
//  get email and password from frontend
// check for empty fields
// check if user exists
// compare password
// generate jwt tokenimport {cook}

// save refresh token in db
// send jwt token and refresh token in response

const { email, password } = req.body;
if(!email || !password) return res.status(400).json(new ApiError("Email and password are mandatory",400));

const user = await User.findOne({email});
if(!user) return res.status(401).json(new ApiError("User not found",401));


const match = await user.comparePassword(password);
if(!match) return res.status(401).json(new ApiError("Invalid Password",401));

const accessToken = await user.generateAccessToken();
const refreshToken = await user.generateRefreshToken()
const RefresTokenoptions = {
  httpOnly:true,
  secure:true,
  maxAge: 10*24*60*60*1000,  // 10 days
}

const AccessTokenoptions = {
  httpOnly:true,
  secure:true,
  maxAge: 2*60*60*1000,  // 2 hours
}

const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
loggedInUser.refreshToken = refreshToken;
await loggedInUser.save({validateBeforeSave:false});

res.status(200).cookie("accessToken",accessToken,AccessTokenoptions).cookie("refreshToken",refreshToken,RefresTokenoptions).json(new ApiResponse(200,"Login Successfull",{loggedInUser,accessToken,refreshToken}));

});

//  LOGOUT USER
const logoutUser = asyncHandler(async (req,res) => {
  // take user from frontend
  // delete refresh token 
  // remove cookies
  
  const user = await User.findOneAndUpdate(
    {email:req?.user?.email},
    {
      $unset: {
        refreshToken: 1 // this removes the field from document
      }
  },
  {
    new: true
  }
)
     const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,"User logged Out",[]));

})

// REFRESH TOKEN
const refreshTokenToAccessToken = asyncHandler(async (req,res) => {

  // get refresh token from frontend
  // check for empty fields
  // check if user exists
  // compare refresh token
  // generate jwt tokenimport {cook}

  // save refresh token in db
  // send jwt token and refresh token in response

  const incomingRefreshToken = req?.cookies?.refreshToken || req.header("Authorization").replace("Bearer ","");
  if(!incomingRefreshToken) return res.status(400).json(new ApiError("Refresh Token is mandatory",400));

  const userId = jwt.verify(incomingRefreshToken,process.env.JWT_SECRET)._id;
  const user = await User.findById(userId);

  if(!user) return res.status(401).json(new ApiError("User not found",401));

  if(user.refreshToken !== incomingRefreshToken) return res.status(401).json(new ApiError("Invalid Refresh Token",401));

  const {accessToken, refreshToken} = await user.generateAccessAndRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({validateBeforeSave:false});

  const AccessTokenoptions = {
    httpOnly:true,
    secure:true,
    maxAge: 2*60*60*1000,  // 2 hours
  }

  const RefresTokenoptions = {
    httpOnly:true,
    secure:true,
    maxAge: 10*24*60*60*1000,  // 10 days
  }

  res.status(200).cookie("accessToken",accessToken,AccessTokenoptions).cookie("refreshToken",refreshToken,RefresTokenoptions).json(new ApiResponse(200,"Token Refreshed successfully",{accessToken,refreshToken}));


});


export { registerUser, generateOTP, loginUser, logoutUser, refreshTokenToAccessToken};
