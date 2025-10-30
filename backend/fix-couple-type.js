const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Migration des paris de type "couple" vers "couple_gagnant"...');
  
  try {
    const result = await prisma.$executeRaw`
      UPDATE "bets" 
      SET "bet_type" = 'couple_gagnant'::"HorseBetType" 
      WHERE "bet_type" = 'couple'::"HorseBetType"
    `;
    
    console.log(`✅ ${result} paris migrés avec succès !`);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    
    // Si l'erreur est que 'couple' n'existe plus, c'est OK
    if (error.message.includes('invalid input value for enum')) {
      console.log('✅ Le type "couple" n\'existe plus, migration déjà effectuée');
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
