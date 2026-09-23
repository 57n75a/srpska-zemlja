// Seeds 100 regions and 1,000,000 units (100 blocks x 100 units each).
// Run once against a fresh database: `npm run prisma:seed`
// NOTE: inserts in batches — 1,000,000 rows will take a few minutes
// depending on your database tier.

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function regionLabel(n) {
  return String.fromCharCode(65 + Math.floor(n / 10)) + (n % 10);
}

// Same deterministic scatter used in the demo, so seed data matches
// what people saw in the interactive demo before real accounts existed.
function isTaken(globalId) {
  return (globalId * 2654435761 % 977) < 6;
}

async function main() {
  console.log('Seeding 100 regions...');
  for (let r = 0; r < 100; r++) {
    await prisma.region.upsert({
      where: { id: r },
      update: {},
      create: { id: r, label: regionLabel(r) },
    });
  }

  console.log('Seeding 1,000,000 units in batches...');
  const BATCH = 5000;
  let batch = [];

  for (let r = 0; r < 100; r++) {
    for (let b = 0; b < 100; b++) {
      for (let u = 0; u < 100; u++) {
        const id = r * 10000 + b * 100 + u;
        batch.push({
          id,
          regionId: r,
          blockIndex: b,
          unitIndex: u,
          status: isTaken(id) ? 'RESERVED' : 'AVAILABLE',
        });
        if (batch.length >= BATCH) {
          await prisma.unit.createMany({ data: batch, skipDuplicates: true });
          batch = [];
        }
      }
    }
    if (r % 10 === 0) console.log(`  ...region ${r}/100`);
  }
  if (batch.length) {
    await prisma.unit.createMany({ data: batch, skipDuplicates: true });
  }

  console.log('Done.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
