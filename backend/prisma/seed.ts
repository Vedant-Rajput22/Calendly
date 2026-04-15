import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL || "";
const shouldUseAccelerate =
  databaseUrl.startsWith("prisma://") ||
  databaseUrl.startsWith("prisma+postgres://");

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const prismaClient = shouldUseAccelerate
  ? new PrismaClient({ accelerateUrl: databaseUrl })
  : new PrismaClient({
      adapter: new PrismaPg({ connectionString: databaseUrl }),
    });
const prisma = shouldUseAccelerate
  ? prismaClient.$extends(withAccelerate())
  : prismaClient;

async function main() {
  console.log("🌱 Starting seed...");

  // Clean existing data
  await prisma.booking.deleteMany();
  await prisma.dateOverride.deleteMany();
  await prisma.availabilityWindow.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.eventType.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create default user
  const user = await prisma.user.create({
    data: {
      id: "default-user-id",
      name: "Vedan",
      email: "vedan@calendly.com",
      timezone: "Asia/Kolkata",
    },
  });
  console.log(`✅ Created user: ${user.name}`);

  if (process.env.GOOGLE_CALENDAR_REFRESH_TOKEN) {
    await prisma.account.create({
      data: {
        userId: user.id,
        type: "oauth",
        provider: "google",
        providerAccountId: `calendar_${user.id}`,
        refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN,
        access_token: null,
        scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
        token_type: "Bearer",
      },
    });
    console.log("✅ Attached fallback Google Calendar token to default user");
  } else {
    console.log("ℹ️ GOOGLE_CALENDAR_REFRESH_TOKEN not set; Meet links won't be auto-created in no-login mode");
  }

  // 2. Create 3 event types (15/30/60 min)
  const eventTypes = await Promise.all([
    prisma.eventType.create({
      data: {
        userId: user.id,
        name: "Quick Chat",
        slug: "quick-chat",
        description: "A quick 15-minute introductory call",
        durationMins: 15,
        color: "#0069ff",
        isActive: true,
      },
    }),
    prisma.eventType.create({
      data: {
        userId: user.id,
        name: "One-on-One Meeting",
        slug: "one-on-one",
        description: "A focused 30-minute meeting for detailed discussions",
        durationMins: 30,
        color: "#ff6b00",
        isActive: true,
      },
    }),
    prisma.eventType.create({
      data: {
        userId: user.id,
        name: "Deep Dive Session",
        slug: "deep-dive",
        description:
          "A full 60-minute session for comprehensive project reviews",
        durationMins: 60,
        color: "#7b2ff7",
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ Created ${eventTypes.length} event types`);

  // 3. Create Mon–Fri 9–5 availability
  const daysOfWeek = [
    { dayOfWeek: 0, name: "Sunday", isEnabled: false },
    { dayOfWeek: 1, name: "Monday", isEnabled: true },
    { dayOfWeek: 2, name: "Tuesday", isEnabled: true },
    { dayOfWeek: 3, name: "Wednesday", isEnabled: true },
    { dayOfWeek: 4, name: "Thursday", isEnabled: true },
    { dayOfWeek: 5, name: "Friday", isEnabled: true },
    { dayOfWeek: 6, name: "Saturday", isEnabled: false },
  ];

  for (const day of daysOfWeek) {
    const availability = await prisma.availability.create({
      data: {
        userId: user.id,
        dayOfWeek: day.dayOfWeek,
        isEnabled: day.isEnabled,
        startTime: "09:00",
        endTime: "17:00",
      },
    });

    await prisma.availabilityWindow.create({
      data: {
        availabilityId: availability.id,
        startTime: "09:00",
        endTime: "17:00",
        sortOrder: 0,
      },
    });
  }
  console.log("✅ Created Mon–Fri 9–5 availability");

  // 4. Create 3 sample bookings
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setUTCHours(10, 0, 0, 0);

  // Ensure tomorrow is a weekday
  while (tomorrow.getUTCDay() === 0 || tomorrow.getUTCDay() === 6) {
    tomorrow.setDate(tomorrow.getDate() + 1);
  }

  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
  while (
    dayAfterTomorrow.getUTCDay() === 0 ||
    dayAfterTomorrow.getUTCDay() === 6
  ) {
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
  }

  const twoDaysLater = new Date(dayAfterTomorrow);
  twoDaysLater.setDate(twoDaysLater.getDate() + 1);
  while (twoDaysLater.getUTCDay() === 0 || twoDaysLater.getUTCDay() === 6) {
    twoDaysLater.setDate(twoDaysLater.getDate() + 1);
  }

  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        eventTypeId: eventTypes[0].id,
        inviteeName: "Alice Johnson",
        inviteeEmail: "alice@example.com",
        startTime: tomorrow,
        endTime: new Date(tomorrow.getTime() + 15 * 60000),
        timezone: "Asia/Kolkata",
        status: "confirmed",
      },
    }),
    prisma.booking.create({
      data: {
        eventTypeId: eventTypes[1].id,
        inviteeName: "Bob Smith",
        inviteeEmail: "bob@example.com",
        startTime: new Date(dayAfterTomorrow.getTime() + 2 * 3600000), // 12:00
        endTime: new Date(
          dayAfterTomorrow.getTime() + 2 * 3600000 + 30 * 60000
        ), // 12:30
        timezone: "America/New_York",
        status: "confirmed",
      },
    }),
    prisma.booking.create({
      data: {
        eventTypeId: eventTypes[2].id,
        inviteeName: "Charlie Davis",
        inviteeEmail: "charlie@example.com",
        startTime: new Date(twoDaysLater.getTime() + 4 * 3600000), // 14:00
        endTime: new Date(
          twoDaysLater.getTime() + 4 * 3600000 + 60 * 60000
        ), // 15:00
        timezone: "Europe/London",
        status: "confirmed",
      },
    }),
  ]);
  console.log(`✅ Created ${bookings.length} sample bookings`);

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
