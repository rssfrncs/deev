-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL,
    "views" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TagToVideo" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TagToVideo_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TagToVideo_B_fkey" FOREIGN KEY ("B") REFERENCES "Video" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_TagToVideo_AB_unique" ON "_TagToVideo"("A", "B");

-- CreateIndex
CREATE INDEX "_TagToVideo_B_index" ON "_TagToVideo"("B");
