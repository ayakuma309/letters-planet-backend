const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const isAuthenticated = require("../middlewares/isAuthenticated");

// prismaのインスタンスを作成
const prisma = new PrismaClient();

//コメントの作成
router.post("/comment",isAuthenticated,async (req, res) => {
  const { postId, content } = req.body;
  if (!content) {
    return res.status(400).json({ error: "コメントを入力してください" });
  }
  try {
    const newComment = await prisma.comment.create({
      data: {
        content: content,
        postId: Number(postId),
        userId: req.userId,
      },
      //usernameアクセスするためにincludeを使う
      include: {
        user: true,
        post: true,
      },
    });

    res.status(201).json(newComment);
  } catch (err) {
    return res.status(500).json({ error: "コメントの作成中にエラーが発生しました" });
  }
});

// コメントの取得エンドポイントを追加
router.get("/comments/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const comments = await prisma.comment.findMany({
      where: {
        postId: Number(postId),
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        }
      },
    });

    res.status(200).json(comments);
  } catch (err) {
    return res.status(500).json({ error: "コメントの取得中にエラーが発生しました" });
  }
});

module.exports = router;
