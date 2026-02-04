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
