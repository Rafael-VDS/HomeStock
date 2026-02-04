import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Liste de 10 utilisateurs
  const users = [
    { firstname: 'Alice', lastname: 'Martin', avatar: 'alice-martin.jpg' },
    { firstname: 'Bob', lastname: 'Dupont', avatar: 'bob-dupont.jpg' },
    { firstname: 'Charlie', lastname: 'Bernard', avatar: 'charlie-bernard.jpg' },
    { firstname: 'Diana', lastname: 'Petit', avatar: 'diana-petit.jpg' },
    { firstname: 'Ethan', lastname: 'Robert', avatar: 'ethan-robert.jpg' },
    { firstname: 'Fiona', lastname: 'Richard', avatar: 'fiona-richard.jpg' },
    { firstname: 'Gabriel', lastname: 'Durand', avatar: 'gabriel-durand.jpg' },
    { firstname: 'Hannah', lastname: 'Leroy', avatar: 'hannah-leroy.jpg' },
    { firstname: 'Isaac', lastname: 'Moreau', avatar: 'isaac-moreau.jpg' },
    { firstname: 'Julia', lastname: 'Simon', avatar: 'julia-simon.jpg' },
  ];

  const hashedPassword = await bcrypt.hash('Password123', 10);

  for (const user of users) {
    const email = `${user.firstname.toLowerCase()}.${user.lastname.toLowerCase()}@example.com`;
    
    const existingUser = await prisma.user.findFirst({
      where: { mail: email },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          firstname: user.firstname,
          lastname: user.lastname,
          mail: email,
          password: hashedPassword,
          picture: `/uploads/avatars/${user.avatar}`,
        },
      });
      console.log(`✅ Created user: ${user.firstname} ${user.lastname}`);
    } else {
      console.log(`⏭️  User already exists: ${user.firstname} ${user.lastname}`);
    }
  }
  // Créer une maison de démonstration
  const demoHome = await prisma.home.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Maison Familiale',
    },
  });
  console.log(`✅ Created home: ${demoHome.name}`);

  // Liste des catégories avec images
  const categories = [
    { name: 'Fruits et Légumes', picture: '/uploads/categories/fruits.jpg' },
    { name: 'Légumes', picture: '/uploads/categories/legumes.jpg' },
    { name: 'Viandes et Poissons', picture: '/uploads/categories/viandes.jpg' },
    { name: 'Céréales et Pâtes', picture: '/uploads/categories/cereales.jpg' },
    { name: 'Produits Laitiers', picture: '/uploads/categories/produits-laitiers.jpg' },
    { name: 'Boissons', picture: '/uploads/categories/boissons.jpg' },
    { name: 'Snacks et Confiseries', picture: '/uploads/categories/snacks.jpg' },
    { name: 'Surgelés', picture: '/uploads/categories/surgeles.jpg' },
    { name: 'Condiments et Sauces', picture: '/uploads/categories/condiments.jpg' },
    { name: 'Hygiène et Entretien', picture: '/uploads/categories/hygiene.jpg' },
  ];

  for (const category of categories) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        homeId: demoHome.id,
        name: category.name,
      },
    });

    if (!existingCategory) {
      await prisma.category.create({
        data: {
          homeId: demoHome.id,
          name: category.name,
          picture: category.picture,
        },
      });
      console.log(`✅ Created category: ${category.name}`);
    } else {
      console.log(`⏭️  Category already exists: ${category.name}`);
    }
  }
  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
