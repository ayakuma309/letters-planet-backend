const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const isAuthenticated = require("../middlewares/isAuthenticated");

// prismaのインスタンスを作成
const prisma = new PrismaClient();

//投稿API
router.post("/qiita", isAuthenticated, async (req, res) => {
  const { qiitaId, title, url, userName, profileImageUrl, tags } = req.body;
  if (!qiitaId || !title || !url) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    // tagの名前が存在してたらそのtagを使い、存在してなかったら新しく作る
    const tagPromises = tags.map(async (tagName) => {
      const existingTag = await prisma.qiitaTag.findUnique({
        where: { name: tagName },
      });

      if (existingTag) {
        return existingTag;
      } else {
        return prisma.qiitaTag.create({ data: { name: tagName } });
      }
    });

    const createdTags = await Promise.all(tagPromises);

    const newQiita = await prisma.qiita.create({
      data: {
        qiitaId,
        title,
        url,
        userName,
        profileImageUrl,
        authorId: req.userId,
        tags: {
          connect: createdTags.map((tag) => ({ id: tag.id })),
        },
      },
      //usernameアクセスするためにincludeを使う
      include: {
        author: {
          include: {
            profile: true,
          }
        },
        tags: true,
      },
    });
    res.status(201).json(newQiita);
  } catch (err) {
    console.error("エラー:", err);
    return res.status(500).json({ error: "投稿の作成中にエラーが発生しました" });
  }
});
//投稿取得API
router.get("/get_qiita_articles", async (req, res) => {
  try {
    const qiitaArticles = await prisma.qiita.findMany({
      orderBy: {
        createdAt: "desc",
      },
       //usernameアクセスするためにincludeを使う
      include: {
        author: {
          include: {
            profile: true,
          }
        },
        tags: true,
      },
    });
    return res.status(200).json(qiitaArticles);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err: "something went wrong" });
  }
});

//投稿の削除
router.delete("/qiita/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const qiita = await prisma.qiita.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!qiita) {
      return res
        .status(404)
        .json({ message: "投稿が見つかりませんでした。" });
    }

    if (qiita.authorId !== req.userId) {
      return res
        .status(401)
        .json({ message: "投稿の削除権限がありません。" });
    }

    // 投稿の削除
    await prisma.qiita.delete({
      where: {
        id: parseInt(id),
      },
    });

    res.status(200).json({ message: "投稿を削除しました。" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
