import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

async function main() {
    console.log("Seeding database...")

    // Create demo users
    const hashedPassword = await bcrypt.hash("admin123", 10)

    const admin = await prisma.user.upsert({
        where: { email: "admin@wastemanagement.com" },
        update: {},
        create: {
            email: "admin@wastemanagement.com",
            name: "Admin User",
            password: hashedPassword,
            role: "ADMIN",
        },
    })

    const driver = await prisma.user.upsert({
        where: { email: "driver@wastemanagement.com" },
        update: {},
        create: {
            email: "driver@wastemanagement.com",
            name: "John Driver",
            password: hashedPassword,
            role: "DRIVER",
        },
    })

    const publicUser = await prisma.user.upsert({
        where: { email: "public@example.com" },
        update: {},
        create: {
            email: "public@example.com",
            name: "Public User",
            password: hashedPassword,
            role: "PUBLIC",
        },
    })

    console.log("Created users:", { admin, driver, publicUser })

    // Create demo bins
    const bins = await Promise.all([
        prisma.bin.upsert({
            where: { binId: "BIN-001" },
            update: {},
            create: {
                binId: "BIN-001",
                location: "Main Street & 1st Ave",
                latitude: 40.7128,
                longitude: -74.006,
                capacity: 100,
                currentFillLevel: 85,
                status: "NEEDS_PICKUP",
                lastEmptied: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            },
        }),
        prisma.bin.upsert({
            where: { binId: "BIN-002" },
            update: {},
            create: {
                binId: "BIN-002",
                location: "Park Avenue & 5th St",
                latitude: 40.7589,
                longitude: -73.9851,
                capacity: 100,
                currentFillLevel: 95,
                status: "OVERFLOWING",
                lastEmptied: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            },
        }),
        prisma.bin.upsert({
            where: { binId: "BIN-003" },
            update: {},
            create: {
                binId: "BIN-003",
                location: "Broadway & 42nd St",
                latitude: 40.758,
                longitude: -73.9855,
                capacity: 100,
                currentFillLevel: 45,
                status: "OK",
                lastEmptied: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            },
        }),
        prisma.bin.upsert({
            where: { binId: "BIN-004" },
            update: {},
            create: {
                binId: "BIN-004",
                location: "Madison Ave & 23rd St",
                latitude: 40.7425,
                longitude: -73.9872,
                capacity: 100,
                currentFillLevel: 70,
                status: "NEEDS_PICKUP",
                lastEmptied: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            },
        }),
        prisma.bin.upsert({
            where: { binId: "BIN-005" },
            update: {},
            create: {
                binId: "BIN-005",
                location: "Lexington Ave & 68th St",
                latitude: 40.7687,
                longitude: -73.9658,
                capacity: 100,
                currentFillLevel: 30,
                status: "OK",
                lastEmptied: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            },
        }),
    ])

    console.log(`Created ${bins.length} bins`)

    console.log("Seeding completed!")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })