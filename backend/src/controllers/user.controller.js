import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { DEFAULT_AVATAR } from "../constants.js";
import { uploadOnCloudinary } from "../utils/uploadOnCloudinary.js";

const registerUser = asyncHandler(async (req, res, next) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res
  const { regno, email, fullName, programme, batch, trade, password } =
    req.body;
  if (
    [regno, email, fullName, programme, batch, trade, password].some(
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
          "regno, email, fullName, programme, batch, trade,password are mandatory",
          400
        )
      );
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
    console.log(localAvatarUrl);
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
    return new ApiError("Internal Server Error", 500, [
      "Somethig went wrong while registering user",
    ]);
  console.dir(user);
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  console.dir(createdUser);
  // if(req.files)
  return res
    .status(201)
    .json(new ApiResponse(200, "User Registered successfully", createdUser));
});

export { registerUser };

const loginUser = asyncHandler(async ()=>{
  
})