const router = require("express").Router();
const authCtrl = require("../controllers/auth");

router.post("/signup", authCtrl.signup);
router.post("/signin", authCtrl.signin);

module.exports = router;
