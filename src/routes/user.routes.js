import { Router } from 'express';
import {
  userLogin,
  userLogout,
  userRegistration,
  refreshAccessToken,
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

export default router;
