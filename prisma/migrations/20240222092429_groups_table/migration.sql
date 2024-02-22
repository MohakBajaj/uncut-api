-- CreateTable
CREATE TABLE "Groups" (
    "id" TEXT NOT NULL,
    "group_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Groups_group_name_key" ON "Groups"("group_name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_group_affiliation_fkey" FOREIGN KEY ("group_affiliation") REFERENCES "Groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
