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
