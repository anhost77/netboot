import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@bettracker.pro';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';
  const firstName = 'Admin';
  const lastName = 'BetTracker';

  try {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log('✅ Admin already exists:', email);
      console.log('Role:', existingAdmin.role);
      
      // Si l'utilisateur existe mais n'est pas admin, le promouvoir
      if (existingAdmin.role !== UserRole.admin) {
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: { role: UserRole.admin },
        });
        console.log('✅ User promoted to admin role');
      }
      
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'admin
    const admin = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        role: UserRole.admin,
        emailVerifiedAt: new Date(),
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Role:', admin.role);
    console.log('\n⚠️  Please change the password after first login!');
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
