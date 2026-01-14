const router = require("express").Router();
const verifyToken = require("../middleware/auth");
const usersCtrl = require("../controllers/users");

router.get("/users/me", verifyToken, usersCtrl.getCurrentUser);

router.put("/users/:id", verifyToken, usersCtrl.updateUser);

router.put(
  "/users/:id/assign-caregiver",
  verifyToken,
  usersCtrl.assignCaregiver
);

module.exports = router;
