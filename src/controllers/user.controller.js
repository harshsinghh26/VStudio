import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiErrors.js';
import { User } from '../models/users.models.js';
import { uploadOnCloudinary } from '../utils/Cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

//Generate Tokens

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      'Something went wrong while genrating access token and refresh token',
    );
  }
};

// User Registration

const userRegistration = asyncHandler(async (req, res) => {
  //get user details from frantend
  // validation - not empty
  //check i user already exists: username, email
  // check for images, check for avatar
  // Il upload them to cloudinary, avatar
  // create user object - create entry in do I remove password and refresh token field from response
  // check for user creation
  // return res

  const { fullName, email, username, password } = req.body;
  //   console.log(req.body);
  if (
    [fullName, email, username, password].some((field) => field?.trim() === '')
  ) {
    throw new ApiError(400, 'All Fields are required!');
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, 'User with email already exist!');
  }

  const avatarFilePath = req.files?.avatar[0]?.path;
  //   const coverImageFilePath = req.files?.coverImage[0]?.path;
  //   console.log(req.files);

  let coverImageFilePath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageFilePath = req.files.coverImage[0].path;
  }

  if (!avatarFilePath) {
    throw new ApiError(400, 'avatar is required');
  }

  const avatar = await uploadOnCloudinary(avatarFilePath);
  const coverImage = await uploadOnCloudinary(coverImageFilePath);

  if (!avatar) {
    throw new ApiError(400, 'avatar is required');
  }

  const user = await User.create({
    fullName,
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || '',
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken',
  );

  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while registering the user!');
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, 'User Created Succesfully'));
});

// User Login

const userLogin = asyncHandler(async (req, res) => {
  // user data -> req.body
  //user exist
  //password right or wrong
  //generate AT and RT
  // send in form cokiee

  const { username, email, password } = req.body;
  //   console.log(email);

  if (!(username || email)) {
    throw new ApiError(400, 'please enter username or email!');
  }

  //   console.log(req.body);
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, 'User not Found!');
  }
  const ispassword = await user.isPasswordCorrect(password);

  //   console.log(ispassword);
  if (!ispassword) {
    throw new ApiError(401, 'Incorrect user Credential');
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken',
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        'User Logged In Succesfully!',
      ),
    );
});

// User Logout

const userLogout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    },
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'User Loged Out!'));
});

//new Refresh Token

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Unaouthorized Request!');
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, 'Unaouthorized User!');
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    res
      .status(200)
      .cookie('accessToken', accessToken)
      .cookie('refreshToken', newRefreshToken)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          'New Refresh Token Generated',
        ),
      );
  } catch (error) {
    throw new ApiError(500, error);
  }
});

// Export

export { userRegistration, userLogin, userLogout, refreshAccessToken };
