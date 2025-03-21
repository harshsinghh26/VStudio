import { asyncHandler } from '../utils/asyncHandler.js';

const userRegistration = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: 'ok',
  });
});

export { userRegistration };
