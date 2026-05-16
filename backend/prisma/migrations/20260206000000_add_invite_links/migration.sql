-- CreateTable
CREATE TABLE "invite_links" (
    "id" SERIAL NOT NULL,
    "home_id" INTEGER NOT NULL,
    "link" VARCHAR(25) NOT NULL,
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invite_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invite_links_link_key" ON "invite_links"("link");

-- AddForeignKey
ALTER TABLE "invite_links" ADD CONSTRAINT "invite_links_home_id_fkey" FOREIGN KEY ("home_id") REFERENCES "homes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
