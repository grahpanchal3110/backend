import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //   res.status(200).json({
  //     message: "User registered successfully",
  //   });
  //get user details from frontend
  //validation - not empty
  //check if user already exists : username and email
  //check for images and for avatar
  //upload them to cloudinary, avatar check
  //create user object - create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return response

  const { username, fullname, email, password } = req.body;
  console.log("email:", email);
  console.log("password:", password);

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existeduser = User.findOne({
    $or: [{ username }, { email }],
  });
  if (existeduser) {
    throw new ApiError(409, "User already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatarUrl = await uploadOnCloudinary(avatarLocalPath);
  const coverImageUrl = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatarUrl) {
    throw new ApiError(400, "Failed to upload avatr to cloudinary");
  }

  const user = await User.create({
    username,
    fullname,
    email,
    password,
    avatar: avatarUrl.url,
    coverImage: coverImageUrl?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export { registerUser };
