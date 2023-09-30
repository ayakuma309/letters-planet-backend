const jwt = require('jsonwebtoken');


//認証ヘッダにトークンがあるユーザーだけ投稿できるミドルウェアを作成
//tokenの検出とトークンがない場合ははかせる
function isAuthenticated(req, res, next) {
  //`Bearer ${token}`のtokenを取得
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "token is required" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "ログインしてください" });
    }

    req.userId = decoded.id;
    next();
  });
}

module.exports = isAuthenticated;
