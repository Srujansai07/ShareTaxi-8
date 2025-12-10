// prisma/seed.ts - Database Seed Script
import { PrismaClient } from '@prisma/client'
import { BANGALORE_BUILDINGS } from './data/buildings'
import { ACHIEVEMENTS } from './data/achievements'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seed...')

    // Seed Buildings
    console.log('📍 Seeding buildings...')
    for (const building of BANGALORE_BUILDINGS) {
        await prisma.building.upsert({
            where: { id: building.id },
            update: building,
            create: building,
        })
    }
    console.log(`✅ Seeded ${BANGALORE_BUILDINGS.length} buildings`)

    // Seed Achievements
    console.log('🏆 Seeding achievements...')
    for (const achievement of ACHIEVEMENTS) {
        await prisma.achievement.upsert({
            where: { name: achievement.name },
            update: achievement,
            create: achievement,
        })
    }
    console.log(`✅ Seeded ${ACHIEVEMENTS.length} achievements`)

    console.log('🎉 Database seeding completed!')
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
