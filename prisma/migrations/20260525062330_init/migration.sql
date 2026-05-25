-- CreateTable
CREATE TABLE "Roaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT NOT NULL,

    CONSTRAINT "Roaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bean" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "url" TEXT NOT NULL,
    "roastLevel" TEXT NOT NULL,
    "varietal" TEXT NOT NULL,
    "flavourNotes" TEXT NOT NULL,
    "processingMethod" TEXT NOT NULL,
    "roasterId" TEXT NOT NULL,

    CONSTRAINT "Bean_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Roaster_name_key" ON "Roaster"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Bean_name_key" ON "Bean"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Bean_url_key" ON "Bean"("url");

-- AddForeignKey
ALTER TABLE "Bean" ADD CONSTRAINT "Bean_roasterId_fkey" FOREIGN KEY ("roasterId") REFERENCES "Roaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
