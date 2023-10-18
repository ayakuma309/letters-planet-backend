const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const isAuthenticated = require("../middlewares/isAuthenticated");


const prisma = new PrismaClient();

router.get("/find", isAuthenticated, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.userId,
      },
    });

    if(!user){
      res.status(404).json({error: "user not found"});
    }

    // パスワードを返さないようにする
    return res.status(200).json({
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    return res.status(500).json({ err: "something went wrong" });
  }
});

module.exports = router;
