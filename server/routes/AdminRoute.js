const UserRoute = require("express").Router();
const firebaseAdmin = require("../config/firebase");

UserRoute.get("/", async (req, res) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    req.authToken = req.headers.authorization.split(" ")[1];
  } else req.authToken = null;

  try {
    const { authToken } = req;
    const userInfo = await firebaseAdmin
      .auth()
      .verifyIdToken(authToken)
      
    if (userInfo.role === "admin") {
      req.authId = userInfo.uid;
      return res.status(200).json({ data: userInfo });
    }
  } catch (e) {
    return res
      .status(401)
      .send({ error: "You are not authorized to make this request" });
  }
});

module.exports = UserRoute;
