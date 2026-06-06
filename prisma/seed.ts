import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Create a demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@grannysfridge.local" },
    update: {},
    create: { name: "阿嬤", email: "demo@grannysfridge.local" },
  });

  // Create default locations
  const locations = [
    { name: "冰箱右門", type: "FRIDGE", icon: "", color: "#4A9EFF", sortOrder: 0, imageTemplate: "double-door-fridge", regionId: "right-door" },
    { name: "冰箱左門", type: "FRIDGE", icon: "", color: "#4A9EFF", sortOrder: 1, imageTemplate: "double-door-fridge", regionId: "left-door" },
    { name: "冷凍庫", type: "FREEZER", icon: "", color: "#7BB8FF", sortOrder: 2, imageTemplate: "double-door-fridge", regionId: "bottom-freezer" },
    { name: "櫥櫃上層", type: "CABINET", icon: "", color: "#d29922", sortOrder: 3, imageTemplate: "cabinet", regionId: "top-shelf" },
    { name: "收納欄", type: "BASKET", icon: "", color: "#3fb950", sortOrder: 4, imageTemplate: "basket", regionId: "main-basket" },
    { name: "辦公櫃一抽", type: "OFFICE_CABINET", icon: "", color: "#f0883e", sortOrder: 5, imageTemplate: "office-cabinet", regionId: "drawer-1" },
    { name: "層架第一層", type: "SHELF", icon: "", color: "#d29922", sortOrder: 6, imageTemplate: "mobile-shelf", regionId: "tier-1" },
  ];

  for (const loc of locations) {
    await prisma.location.upsert({
      where: { id: `seed-${loc.name}` },
      update: {},
      create: { id: `seed-${loc.name}`, ...loc, userId: user.id },
    });
  }

  console.log(" Seed data created");
}

main().catch(console.error).finally(() => prisma.$disconnect());