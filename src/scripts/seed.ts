/**
 * Database seed script
 * Run with: npx tsx src/scripts/seed.ts
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/civic-platform";

async function seed() {
  console.log("🌱 Seeding database...");
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db!;

  // Clear data
  for (const col of ["users", "authorities", "complaints", "votes", "donationcampaigns", "donationtransactions", "announcements", "volunteers", "events"]) {
    try { await db.collection(col).deleteMany({}); } catch {}
  }

  const hash = await bcrypt.hash("Password123", 12);
  const now = new Date();

  // Users
  const users = await db.collection("users").insertMany([
    { name: "Admin User", email: "admin@civic.com", password: hash, role: "admin", isVerified: true, createdAt: now, updatedAt: now },
    { name: "John Citizen", email: "john@civic.com", password: hash, role: "user", isVerified: true, createdAt: now, updatedAt: now },
    { name: "Jane Doe", email: "jane@civic.com", password: hash, role: "user", isVerified: true, createdAt: now, updatedAt: now },
    { name: "Road Authority", email: "road@authority.com", password: hash, role: "authority", organization: "Public Works Dept", isVerified: true, createdAt: now, updatedAt: now },
    { name: "Water NGO", email: "water@ngo.com", password: hash, role: "ngo", organization: "Clean Water Foundation", isVerified: true, createdAt: now, updatedAt: now },
    { name: "Safety Corps", email: "safety@authority.com", password: hash, role: "authority", organization: "Community Safety", isVerified: true, createdAt: now, updatedAt: now },
  ]);
  const uid = Object.values(users.insertedIds);

  // Authorities
  await db.collection("authorities").insertMany([
    { name: "Public Works Department", email: "road@authority.com", type: "authority", categories: ["Road", "Electricity"], userId: uid[3], createdAt: now, updatedAt: now },
    { name: "Clean Water Foundation", email: "water@ngo.com", type: "ngo", categories: ["Water"], userId: uid[4], createdAt: now, updatedAt: now },
    { name: "Community Safety Corps", email: "safety@authority.com", type: "authority", categories: ["Safety", "Garbage"], userId: uid[5], createdAt: now, updatedAt: now },
  ]);

  // Complaints (no donation fields)
  const complaints = [
    {
      title: "Large Pothole on Main Street", description: "There is a large pothole on Main Street near Oak Avenue. It has been growing for two weeks and poses a serious risk to vehicles. The pothole is approximately 2 feet wide and 6 inches deep.",
      category: "Road", location: { address: "123 Main Street, Downtown", lat: 28.6139, lng: 77.209 }, images: [], status: "In Progress", priority: "High", upvotes: 24, upvotedBy: [], assignedTo: uid[3], createdBy: uid[1], isAnonymous: false,
      timeline: [
        { status: "Pending", comment: "Complaint submitted", updatedBy: uid[1], updatedByName: "John Citizen", createdAt: new Date(Date.now() - 86400000 * 5) },
        { status: "Verified", comment: "Issue verified by field inspector", updatedBy: uid[0], updatedByName: "Admin User", createdAt: new Date(Date.now() - 86400000 * 3) },
        { status: "In Progress", comment: "Road repair crew dispatched", updatedBy: uid[3], updatedByName: "Road Authority", createdAt: new Date(Date.now() - 86400000) },
      ],
    },
    {
      title: "Broken Water Pipe Flooding Street", description: "A major water pipe burst on Park Road causing severe flooding. Water has been flowing for over 24 hours and is affecting nearby homes.",
      category: "Water", location: { address: "456 Park Road, Westside", lat: 28.62, lng: 77.215 }, images: [], status: "Verified", priority: "High", upvotes: 45, upvotedBy: [], assignedTo: uid[4], createdBy: uid[2], isAnonymous: false,
      timeline: [
        { status: "Pending", comment: "Complaint submitted", updatedBy: uid[2], updatedByName: "Jane Doe", createdAt: new Date(Date.now() - 86400000 * 2) },
        { status: "Verified", comment: "Emergency team notified", updatedBy: uid[0], updatedByName: "Admin User", createdAt: new Date(Date.now() - 86400000) },
      ],
    },
    {
      title: "Street Lights Not Working on Elm Avenue", description: "Several street lights on Elm Avenue have been out for over a week. The area is very dark at night and residents feel unsafe.",
      category: "Electricity", location: { address: "Elm Avenue, Block 5-8", lat: 28.618, lng: 77.22 }, images: [], status: "Pending", priority: "Medium", upvotes: 12, upvotedBy: [], createdBy: uid[1], isAnonymous: false,
      timeline: [{ status: "Pending", comment: "Complaint submitted", updatedBy: uid[1], updatedByName: "John Citizen", createdAt: new Date(Date.now() - 86400000 * 7) }],
    },
    {
      title: "Garbage Dump Near Residential Area", description: "An illegal garbage dump has formed near Cedar Lane. The waste is attracting stray animals and creating a health hazard.",
      category: "Garbage", location: { address: "Cedar Lane, East Block", lat: 28.625, lng: 77.205 }, images: [], status: "Resolved", priority: "Medium", upvotes: 33, upvotedBy: [], assignedTo: uid[5], createdBy: uid[2], isAnonymous: false,
      timeline: [
        { status: "Pending", comment: "Complaint submitted", updatedBy: uid[2], updatedByName: "Jane Doe", createdAt: new Date(Date.now() - 86400000 * 14) },
        { status: "Resolved", comment: "Area cleaned and signage installed", updatedBy: uid[5], updatedByName: "Safety Corps", createdAt: new Date(Date.now() - 86400000 * 5) },
      ],
    },
    {
      title: "Unsafe Pedestrian Crossing at School Zone", description: "The pedestrian crossing near City Public School has faded markings and no signal. Children are at risk.",
      category: "Safety", location: { address: "School Road, Sector 7", lat: 28.63, lng: 77.21 }, images: [], status: "Pending", priority: "High", upvotes: 56, upvotedBy: [], isAnonymous: true,
      timeline: [{ status: "Pending", comment: "Complaint submitted anonymously", updatedBy: new mongoose.Types.ObjectId(), updatedByName: "Anonymous", createdAt: new Date(Date.now() - 86400000 * 3) }],
    },
  ];

  for (const c of complaints) {
    await db.collection("complaints").insertOne({ ...c, createdAt: new Date(Date.now() - Math.random() * 86400000 * 14), updatedAt: now });
  }

  // Donation Campaigns
  await db.collection("donationcampaigns").insertMany([
    {
      title: "Repair Community Park Infrastructure", description: "Help us fix the broken playground equipment, park benches, and walking paths in Central Community Park. Your contributions directly improve the safety and quality of the park for families and children.",
      category: "Infrastructure", images: [], qrCodeImage: "https://via.placeholder.com/400x400?text=QR+Code", upiId: "civicpark@upi",
      goalAmount: 150000, raisedAmount: 45000, isActive: true, createdBy: uid[0], createdAt: new Date(Date.now() - 86400000 * 10), updatedAt: now,
    },
    {
      title: "Books & Supplies for Government School", description: "Support underprivileged students with textbooks, stationery, and learning materials. Help bridge the education gap and give every child a fair chance.",
      category: "Education", images: [], qrCodeImage: "https://via.placeholder.com/400x400?text=QR+Code", upiId: "civicedu@upi",
      goalAmount: 50000, raisedAmount: 20000, isActive: true, createdBy: uid[0], createdAt: new Date(Date.now() - 86400000 * 5), updatedAt: now,
    },
    {
      title: "Flood Relief Fund", description: "Emergency relief fund for families affected by recent flooding in the southern districts. Funds will be used for food, clothing, and temporary shelter.",
      category: "Disaster Relief", images: [], qrCodeImage: "https://via.placeholder.com/400x400?text=QR+Code",
      goalAmount: 500000, raisedAmount: 125000, isActive: true, createdBy: uid[0], createdAt: new Date(Date.now() - 86400000 * 2), updatedAt: now,
    },
  ]);

  // Announcements
  await db.collection("announcements").insertMany([
    { title: "Water Supply Disruption Notice", content: "Water supply will be disrupted in Sectors 5-8 on Saturday from 10 AM to 4 PM for maintenance work.", type: "warning", isActive: true, isPinned: true, createdBy: uid[0], createdAt: now, updatedAt: now },
    { title: "New Volunteer Program Launched", content: "We've launched a new weekend volunteer program for park cleanup. Sign up on the Volunteer page!", type: "info", isActive: true, isPinned: false, createdBy: uid[0], createdAt: now, updatedAt: now },
  ]);

  // Volunteer Opportunities
  await db.collection("volunteers").insertMany([
    {
      title: "River Cleanup Drive", description: "Join us for a massive river cleanup drive along the Yamuna banks. Gloves, bags, and refreshments will be provided. Let's restore our waterways!",
      category: "Cleanup", location: "Yamuna River Bank, Sector 12", date: new Date(Date.now() + 86400000 * 7), spotsTotal: 50, spotsFilled: 12, volunteers: [],
      contactEmail: "water@ngo.com", images: [], isActive: true, createdBy: uid[4], createdAt: now, updatedAt: now,
    },
    {
      title: "Tree Plantation Drive", description: "Plant 500 saplings in the deforested area near the eastern bypass. Help combat pollution and climate change.",
      category: "Tree Plantation", location: "Eastern Bypass, Green Belt Area", date: new Date(Date.now() + 86400000 * 14), spotsTotal: 100, spotsFilled: 30, volunteers: [],
      contactEmail: "safety@authority.com", images: [], isActive: true, createdBy: uid[5], createdAt: now, updatedAt: now,
    },
  ]);

  // Events
  await db.collection("events").insertMany([
    {
      title: "Community Town Hall Meeting", description: "Monthly town hall where citizens can discuss issues directly with local authorities. All are welcome to share concerns and suggest solutions.",
      location: "Community Center, Main Hall", date: new Date(Date.now() + 86400000 * 5), organizer: "CivicResolve",
      attendees: [], maxAttendees: 200, isActive: true, createdBy: uid[0], createdAt: now, updatedAt: now,
    },
    {
      title: "Road Safety Awareness Workshop", description: "Interactive workshop on road safety, traffic rules, and pedestrian awareness. Special sessions for school children.",
      location: "City Public School, Sector 7", date: new Date(Date.now() + 86400000 * 10), organizer: "Community Safety Corps",
      attendees: [], isActive: true, createdBy: uid[5], createdAt: now, updatedAt: now,
    },
  ]);

  console.log("✅ Database seeded successfully!");
  console.log("\n📧 Test Accounts:");
  console.log("   Admin:     admin@civic.com / Password123");
  console.log("   User:      john@civic.com / Password123");
  console.log("   User:      jane@civic.com / Password123");
  console.log("   Authority: road@authority.com / Password123");
  console.log("   NGO:       water@ngo.com / Password123");
  console.log("   Authority: safety@authority.com / Password123");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => { console.error("Seed failed:", err); process.exit(1); });
