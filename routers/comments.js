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
    const newComment = await prisma.tweet.create({
      data: {
        content: content,
        postId: parseInt(postId),
      },
      include: {
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
    const comments = await prisma.tweet.findMany({
      where: {
        postId: parseInt(postId),
      },
    });

    res.status(200).json(comments);
  } catch (err) {
    return res.status(500).json({ error: "コメントの取得中にエラーが発生しました" });
  }
});

//コメント削除
router.delete("/comment/:commentId",isAuthenticated,async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await prisma.tweet.findUnique({
      where: {
        id: parseInt(commentId),
      },
    });

    if(!comment){
      return res.status(404).json({error:"コメントが見つかりません"})
    }

    await prisma.tweet.delete({
      where:{
        id:parseInt(commentId)
      }
    })
    return res.status(200).json({message:"コメントを削除しました"})
  } catch (err) {
    return res.status(500).json({ error: "コメントの削除中にエラーが発生しました" });
  }
});

module.exports = router;
