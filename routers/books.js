const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const isAuthenticated = require("../middlewares/isAuthenticated");

// prismaのインスタンスを作成
const prisma = new PrismaClient();
//投稿API
router.post("/book", isAuthenticated, async (req, res) => {
  const { bookId, title, description, image, tags } = req.body;
  if (!bookId || !title || !description || !image ) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    // tagの名前が存在してたらそのtagを使い、存在してなかったら新しく作る
    const tagPromises = tags.map(async (tagName) => {
      const existingTag = await prisma.bookTag.findUnique({
        where: { name: tagName },
      });

      if (existingTag) {
        return existingTag;
      } else {
        return prisma.bookTag.create({ data: { name: tagName } });
      }
    });

    const createdTags = await Promise.all(tagPromises);

    const newBook = await prisma.book.create({
      data: {
        bookId,
        title,
        description,
        image,
        tags: {
          connect: createdTags.map((tag) => ({ id: tag.id })),
        },
      },
      include: {
        tags: true,
      },
    });
    res.status(201).json(newBook);
  } catch (err) {
    console.error("エラー:", err);
    return res.status(500).json({ error: "投稿の作成中にエラーが発生しました" });
  }
});

//投稿取得API
router.get("/get_books", async (req, res) => {
  try {
    const books = await prisma.book.findMany({
       //usernameアクセスするためにincludeを使う
      include: {
        tags: true,
      },
    });
    return res.status(200).json(books);
  } catch (err) {
    console.error(err.stack);
    return res.status(500).json({ err: "something went wrong" });
  }
});

//投稿の削除
router.delete("/book/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const book = await prisma.book.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!book) {
      return res
        .status(404)
        .json({ message: "投稿が見つかりませんでした。" });
    }

    // 投稿の削除
    await prisma.book.delete({
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
