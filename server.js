const express = require('express');
const app = express();
const authRoute = require('./routers/auth');
const usersRoute = require('./routers/users');
const postsRoute = require('./routers/posts');
const commentsRoute = require('./routers/comments');
const qiitasRoute = require('./routers/qiitas');

const cors = require('cors');

require('dotenv').config();

const PORT = process.env.PORT || 5000;

app.use(cors());
//json形式で使う設定
app.use(express.json());

//ルーターの設定
app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/posts", postsRoute);
app.use("/api/comments", commentsRoute);
app.use("/api/qiitas", qiitasRoute);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
