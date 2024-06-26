const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const isAuthenticated = require("../middlewares/isAuthenticated");

// prismaのインスタンスを作成
const prisma = new PrismaClient();

//投稿API
router.post("/post", isAuthenticated, async (req, res) => {
  const { videoId, url, title, releaseAt, tags } = req.body;

  if (!title || !url || !releaseAt) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const tagPromises = tags.map(async (tagName) => {
      const existingTag = await prisma.tag.findUnique({
        where: { name: tagName },
      });

      if (existingTag) {
        return existingTag;
      } else {
        return prisma.tag.create({ data: { name: tagName } });
      }
    });

    const createdTags = await Promise.all(tagPromises);

    const newPost = await prisma.youTube.create({
      data: {
        videoId,
        url,
        title,
        releaseAt,
        tags: {
          connect: createdTags.map((tag) => ({ id: tag.id })),
        },
      },
      //usernameアクセスするためにincludeを使う
      include: {
        tags: true,
      },
    });

    res.status(201).json(newPost);
  } catch (err) {
    return res.status(500).json({ error: "投稿の作成中にエラーが発生しました" });
  }
});
//最新投稿取得API
router.get("/get_latest_posts", async (req, res) => {
  try {
    const latestPosts = await prisma.youTube.findMany({
      orderBy: {
        releaseAt: "desc",
      },
       //usernameアクセスするためにincludeを使う
      include: {
        tags: true,
      },
    });
    return res.status(200).json(latestPosts);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: "something went wrong" });
  }
});

//投稿の詳細を取得
router.get("/post/:id", async (req, res) => {
  const { id }  = req.params;
  try {
    const post = await prisma.youTube.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        tags: true,
      },
    });

    if (!post) {
      return res
        .status(404)
        .json({ message: "投稿が見つかりませんでした。" });
    }

    res.status(200).json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

//投稿の削除
router.delete("/post/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const post = await prisma.youTube.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!post) {
      return res
        .status(404)
        .json({ message: "投稿が見つかりませんでした。" });
    }

    await prisma.youTube.delete({
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
