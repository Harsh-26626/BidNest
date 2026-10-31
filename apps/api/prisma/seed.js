import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";

const min = (n) => new Date(Date.now() + n * 60_000);

const passwordHash = await bcrypt.hash("Passw0rd!", 10);
const [meera, rohan] = await Promise.all(
  [["Meera Iyer", "meera@bidnest.dev"], ["Rohan Das", "rohan@bidnest.dev"]].map(([name, email]) =>
    prisma.user.upsert({ where: { email }, update: {}, create: { name, email, passwordHash } })
  )
);

const img = (seed) => [`https://picsum.photos/seed/${seed}/900/700`];
await prisma.auction.createMany({
  data: [
    {
      title: "Signed Cricket Bat",
      description: "Signed by the squad.",
      images: img("bat"),
      startingPrice: 5000,
      bidStep: 500,
      startsAt: min(-10),
      endsAt: min(30),
      createdById: meera.id,
    },
    {
      title: "Handmade Banarasi Saree",
      description: "Pure silk, handwoven.",
      images: img("saree"),
      startingPrice: 8000,
      bidStep: 1000,
      startsAt: min(-5),
      endsAt: min(3),
      createdById: rohan.id,
    },
    {
      title: "Acoustic Guitar",
      description: "Barely used.",
      images: img("guitar"),
      startingPrice: 12000,
      bidStep: 1000,
      startsAt: min(60),
      endsAt: min(120),
      createdById: meera.id,
    },
    {
      title: "Concert Ticket Bundle",
      description: "Two front-row tickets.",
      images: img("tickets"),
      startingPrice: 3000,
      bidStep: 250,
      startsAt: min(-120),
      endsAt: min(-60),
      createdById: rohan.id,
    },
  ],
});
console.log("Seeded. Login: meera@bidnest.dev / Passw0rd!");
await prisma.$disconnect();
