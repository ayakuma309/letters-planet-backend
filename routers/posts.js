const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const isAuthenticated = require("../middlewares/isAuthenticated");

// prismaのインスタンスを作成
const prisma = new PrismaClient();

//投稿API
router.post("/post",isAuthenticated , async (req, res) => {
  const {videoId, title, url,  description, tags} = req.body;

  if (!title || !url || !description|| !tags) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const newPost = await prisma.post.create({
      data: {
        videoId : videoId,
        title: title,
        url: url,
        description: description,
        authorId: req.userId,
        tags: {
          // タグ情報を一括で作成する
          create: tags.map((tagName) => ({
            name: tagName,
          })),
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

    res.status(200).json(newPost);
  } catch (err) {
    return res.status(500).json({ err: "something went wrong" });
  }
});

//最新投稿取得API
router.get("/get_latest_posts", async (req, res) => {
  try {
    const latestPosts = await prisma.post.findMany({
      take: 10,
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
    return res.status(200).json(latestPosts);
  } catch (err) {
    return res.status(500).json({ err: "something went wrong" });
  }
});

//その閲覧しているユーザーの投稿内容だけを取得
router.get("user/:userId", async(req,res) => {
  const user = req.params;
  try {
    const userPosts = await prisma.post.findMany({
      where: {
        authorId: Number(user.userId),
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: true,
        tags: true,
      },
    });
    return res.status(200).json(userPosts);
  } catch (err) {
    return res.status(500).json({ err: "something went wrong" });
  }
});

//投稿の詳細を取得
router.get("/:id", async (req, res) => {
  const { id }  = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        author: true,
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
    const post = await prisma.post.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!post) {
      return res
        .status(404)
        .json({ message: "投稿が見つかりませんでした。" });
    }

    if (post.authorId !== req.userId) {
      return res
        .status(401)
        .json({ message: "投稿の削除権限がありません。" });
    }

    await prisma.post.delete({
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
