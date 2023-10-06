-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "bookId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookTag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "BookTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BookToBookTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_bookId_key" ON "Book"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "BookTag_name_key" ON "BookTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_BookToBookTag_AB_unique" ON "_BookToBookTag"("A", "B");

-- CreateIndex
CREATE INDEX "_BookToBookTag_B_index" ON "_BookToBookTag"("B");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookToBookTag" ADD CONSTRAINT "_BookToBookTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookToBookTag" ADD CONSTRAINT "_BookToBookTag_B_fkey" FOREIGN KEY ("B") REFERENCES "BookTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
