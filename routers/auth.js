const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
// jsonwebtokenをインポート
const jwt = require('jsonwebtoken');


// prismaのインスタンスを作成
const prisma = new PrismaClient()


//新規ユーザー登録API
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  // ここでDBに保存する処理を書く
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword, // ハッシュ化したパスワードを保存
    },
  });

  return res.json({ user });
});

//ユーザーログインAPI
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email: email } });

  if (!user) {
    return res.status(401).json({ error: 'ユーザーが見つかりません' });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return res.status(401).json({ error: 'パスワードが間違っています' });
  }


  const token = jwt.sign({ id: user.id} , process.env.SECRET_KEY, {
    expiresIn: '1d',
  });

  return res.json({ token });
});

module.exports = router;
