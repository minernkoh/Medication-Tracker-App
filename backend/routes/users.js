const router = require("express").Router();
const verifyToken = require("../middleware/auth");
const usersCtrl = require("../controllers/users");

router.get("/users/me", verifyToken, usersCtrl.getCurrentUser);

router.post("/users/me/change-password", verifyToken, usersCtrl.changePassword);

router.put("/users/:id", verifyToken, usersCtrl.updateUser);

router.put(
  "/users/:id/assign-caregiver",
  verifyToken,
  usersCtrl.assignCaregiver,
);

router.delete("/users/:id", verifyToken, usersCtrl.deleteUser);

module.exports = router;
