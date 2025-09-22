const router = require('express').Router();
const ownerAuthController = require('../../../controllers/Auth/owner/owner-authController');
const { verifyOwnerToken } = require('../../../middleware/Auth/verifyToken')

const { isAnyAdmin } = require('../../../middleware/Auth/authorization');

router.route('/register').post(ownerAuthController.registerOwner);
router.route('/login').post(ownerAuthController.loginOwner);
router.route('/logout').get(verifyOwnerToken, ownerAuthController.logoutOwner);

// router.route('/profile').get(verifyOwnerToken, (req,res) => {
//     res.json({
//         message: "Test protected route",
//         user: req.user
//     });
// });

module.exports = router;