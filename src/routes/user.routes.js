import { Router } from 'express';
import {
  userLogin,
  userLogout,
  userRegistration,
  refreshAccessToken,
  changeCurrentPassword,
  getCurentUser,
  chnageAccountDetails,
  updateUserAvatar,
  updateCoverImage,
  userSubscription,
  getWatchHistory,
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';

import { upload } from '../middlewares/multer.middlewares.js';

const router = Router();

router.route('/register').post(
  upload.fields([
    {
      name: 'avatar',
      maxCount: 1,
    },
    {
      name: 'coverImage',
      maxCount: 1,
    },
  ]),

  userRegistration,
);
router.route('/login').post(userLogin);
router.route('/logout').post(verifyJWT, userLogout);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/change-password').post(verifyJWT, changeCurrentPassword);
router.route('/get-currentuser').get(verifyJWT, getCurentUser);
router.route('/update-account').patch(verifyJWT, chnageAccountDetails);
router
  .route('/update-avatar')
  .patch(verifyJWT, upload.single('avatar'), updateUserAvatar);
router
  .route('/update-coverimage')
  .patch(verifyJWT, upload.single('coverImage'), updateCoverImage);
router.route('/c/:username').get(verifyJWT, userSubscription);
router.route('/watch-history').get(verifyJWT, getWatchHistory);

export default router;
