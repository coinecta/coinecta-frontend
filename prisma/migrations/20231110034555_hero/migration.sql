-- CreateTable
CREATE TABLE "hero_carousel" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "image" TEXT,
    "button_title" TEXT NOT NULL,
    "button_link" TEXT NOT NULL,

    CONSTRAINT "hero_carousel_pkey" PRIMARY KEY ("id")
);
