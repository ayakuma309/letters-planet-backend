-- CreateTable
CREATE TABLE "Qiita" (
    "id" SERIAL NOT NULL,
    "qiitaId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "profileImageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "Qiita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QiitaTag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "QiitaTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_QiitaToQiitaTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "QiitaTag_name_key" ON "QiitaTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_QiitaToQiitaTag_AB_unique" ON "_QiitaToQiitaTag"("A", "B");

-- CreateIndex
CREATE INDEX "_QiitaToQiitaTag_B_index" ON "_QiitaToQiitaTag"("B");

-- AddForeignKey
ALTER TABLE "Qiita" ADD CONSTRAINT "Qiita_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QiitaToQiitaTag" ADD CONSTRAINT "_QiitaToQiitaTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Qiita"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QiitaToQiitaTag" ADD CONSTRAINT "_QiitaToQiitaTag_B_fkey" FOREIGN KEY ("B") REFERENCES "QiitaTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
