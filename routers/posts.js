const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const isAuthenticated = require("../middlewares/isAuthenticated");

// prismaのインスタンスを作成
const prisma = new PrismaClient();

//投稿API
router.post("/post",isAuthenticated , async (req, res) => {
  const {videoId, title, url,  description } = req.body;

  if (!title || !url || !description) {
    return res.status(400).json({ error: "is required" });
  }
  try {
    const newPost = await prisma.post.create({
      data: {
        videoId : videoId,
        title: title,
        url: url,
        description: description,
        authorId: req.userId,
      },
      //usernameアクセスするためにincludeを使う
      include: {
        author: {
          include: {
            profile: true,
          }
        },
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
      },
    });
    return res.status(200).json(latestPosts);
  } catch (err) {
    return res.status(500).json({ err: "something went wrong" });
  }
});

//その閲覧しているユーザーの投稿内容だけを取得
router.get("/:userId", async(req,res) => {
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
      },
    });
    return res.status(200).json(userPosts);
  } catch (err) {
    return res.status(500).json({ err: "something went wrong" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: { Id: parseInt( id ) },
      include: {
        author: true,
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
module.exports = router;