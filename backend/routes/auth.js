/**
 * Auth routes
 *
 * Base path (mounted in `server.js`): `/api/auth`
 * - `POST /signup`
 * - `POST /signin`
 */

const router = require("express").Router();
const authCtrl = require("../controllers/auth");
const { check } = require("express-validator");

router.post(
  "/signup",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
    check("name", "Name is required").not().isEmpty(),
  ],
  authCtrl.signup,
);
router.post(
  "/signin",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  authCtrl.signin,
);

module.exports = router;
