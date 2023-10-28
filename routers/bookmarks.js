const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const isAuthenticated = require("../middlewares/isAuthenticated");

// prismaのインスタンスを作成
const prisma = new PrismaClient();

//作成
router.post("/bookmark",isAuthenticated,async (req, res) => {
  //受け取る title startAt
  const { postId, title, startAt } = req.body;
  if (!title) {
    return res.status(400).json({ error: "入力してください" });
  }
  try {
    const newBookmark = await prisma.bookmark.create({
      data: {
        title,
        startAt,
        youTubeIdId: Number(postId),
      },
      //usernameアクセスするためにincludeを使う
      include: {
        post: true,
      },
    });

    res.status(201).json(newBookmark);
  } catch (err) {
    return res.status(500).json({ error: "作成中にエラーが発生しました" });
  }
});

// 取得
router.get("/bookmarks/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        youTubeId: Number(postId),
      },
    });

    res.status(200).json(bookmarks);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "取得中にエラーが発生しました" });
  }
});

//削除
router.delete("/bookmark/:bookmarkId",isAuthenticated,async (req, res) => {
  const { bookmarkId } = req.params;

  try {
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    if(!bookmark){
      return res.status(404).json({error:"見つかりません"})
    }

    await prisma.bookmark.delete({
      where:{
        id: bookmarkId
      }
    })
    return res.status(200).json({message:"削除しました"})
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "削除中にエラーが発生しました" });
  }
});

module.exports = router;
