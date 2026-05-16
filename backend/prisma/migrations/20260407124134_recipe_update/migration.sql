/*
  Warnings:

  - You are about to drop the column `prep_time` on the `recipes` table. All the data in the column will be lost.
  - You are about to drop the column `recipe` on the `recipes` table. All the data in the column will be lost.
  - You are about to drop the `subcategories_products` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `subcategory_id` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `recipes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "subcategories_products" DROP CONSTRAINT "subcategories_products_product_id_fkey";

-- DropForeignKey
ALTER TABLE "subcategories_products" DROP CONSTRAINT "subcategories_products_subcategory_id_fkey";

-- AlterTable
ALTER TABLE "invite_links" ADD COLUMN     "permission_type" TEXT NOT NULL DEFAULT 'read-write';

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "subcategory_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "recipes" DROP COLUMN "prep_time",
DROP COLUMN "recipe",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "subcategories_products";

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

