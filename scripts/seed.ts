import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Import models
import Complaint from "../src/models/Complaint";
import Announcement from "../src/models/Announcement";
import Event from "../src/models/Event";
import Volunteer from "../src/models/Volunteer";
import User from "../src/models/User";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in .env.local");
  process.exit(1);
}

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    // Find or create a dummy user for 'createdBy'
    let admin = await User.findOne({ role: "admin" });
    if (!admin) {
      admin = await User.create({
        name: "Admin System",
        email: "admin@civicresolve.test",
        password: "hashedpassword123", // Doesn't matter, just dummy
        role: "admin",
      });
      console.log("Created dummy admin user.");
    }

    const adminId = admin._id;

    console.log("Clearing existing data (except users)...");
    await Complaint.deleteMany({});
    await Announcement.deleteMany({});
    await Event.deleteMany({});
    await Volunteer.deleteMany({});

    console.log("Seeding Announcements...");
    const announcements = [
      {
        title: "City-Wide Road Repair Drive",
        content: "Starting next month, major roads in downtown will be repaved. Expect some traffic delays.",
        type: "info",
        isPinned: true,
        isActive: true,
        createdBy: adminId,
      },
      {
        title: "Water Contamination Alert",
        content: "Residents in Sector 4 are advised to boil water before drinking until further notice.",
        type: "emergency",
        isPinned: true,
        isActive: true,
        createdBy: adminId,
      },
      {
        title: "Garbage Collection Resumed",
        content: "The striking workers have returned to duty. Regular garbage collection resumes tomorrow.",
        type: "update",
        isPinned: false,
        isActive: true,
        createdBy: adminId,
      }
    ];
    await Announcement.insertMany(announcements);

    console.log("Seeding Complaints...");
    const complaints = [
      {
        title: "Massive Pothole on 5th Avenue",
        description: "There is a massive pothole that has been damaging cars for the last week. It needs immediate attention before a serious accident occurs.",
        category: "Road",
        location: { address: "5th Avenue near Central Park", lat: 40.7812, lng: -73.9665 },
        images: ["https://picsum.photos/seed/pothole1/800/600"],
        status: "Pending",
        priority: "High",
        createdBy: adminId,
        isAnonymous: false,
      },
      {
        title: "Leaking Fire Hydrant",
        description: "Water is continuously leaking out into the street. It's been happening for 3 days and wasting a lot of water.",
        category: "Water",
        location: { address: "Elm Street & 42nd", lat: 40.7580, lng: -73.9855 },
        images: ["https://picsum.photos/seed/hydrant/800/600"],
        status: "In Progress",
        priority: "Medium",
        createdBy: adminId,
        isAnonymous: false,
      },
      {
        title: "Streetlights Out in the Park",
        description: "The entire row of streetlights along the south side of the park is out. It is very unsafe to walk there at night.",
        category: "Electricity",
        location: { address: "South Park Pathway", lat: 40.7644, lng: -73.9730 },
        images: ["https://picsum.photos/seed/streetlight/800/600"],
        status: "Resolved",
        priority: "High",
        createdBy: adminId,
        isAnonymous: true,
      },
      {
        title: "Illegal Dumping Site",
        description: "Someone dumped construction materials on the empty lot next to the school.",
        category: "Garbage",
        location: { address: "Empty lot near Lincoln High", lat: 40.7488, lng: -73.9680 },
        images: ["https://picsum.photos/seed/garbage/800/600"],
        status: "Verified",
        priority: "Medium",
        createdBy: adminId,
        isAnonymous: false,
      },
      {
        title: "Fallen Tree branch blocking road",
        description: "A huge tree branch fell after last night's storm and is blocking one lane.",
        category: "Road",
        location: { address: "Maple Drive", lat: 40.7306, lng: -73.9972 },
        images: ["https://picsum.photos/seed/treebranch/800/600"],
        status: "Pending",
        priority: "Medium",
        createdBy: adminId,
        isAnonymous: false,
      },
      {
        title: "Broken Playground Equipment",
        description: "The swings at the central playground are broken and pose a danger to children.",
        category: "Safety",
        location: { address: "Central Park Playground" },
        images: ["https://picsum.photos/seed/playground/800/600"],
        status: "Pending",
        priority: "High",
        createdBy: adminId,
        isAnonymous: false,
      },
      {
        title: "Overgrown Bushes on Sidewalk",
        description: "The bushes have overgrown onto the sidewalk, making it difficult for pedestrians and wheelchairs to pass.",
        category: "Other",
        location: { address: "Pine Street & 3rd" },
        images: ["https://picsum.photos/seed/bushes/800/600"],
        status: "In Progress",
        priority: "Low",
        createdBy: adminId,
        isAnonymous: true,
      },
      {
        title: "Exposed Electrical Wires",
        description: "There are exposed wires coming out of the electrical box near the subway entrance.",
        category: "Electricity",
        location: { address: "Downtown Subway Station" },
        images: ["https://picsum.photos/seed/wires/800/600"],
        status: "Pending",
        priority: "High",
        createdBy: adminId,
        isAnonymous: false,
      },
      {
        title: "Flooded Underpass",
        description: "The underpass is completely flooded after the recent rain, preventing vehicles from passing through.",
        category: "Water",
        location: { address: "Westside Highway Underpass" },
        images: ["https://picsum.photos/seed/flood/800/600"],
        status: "Verified",
        priority: "High",
        createdBy: adminId,
        isAnonymous: false,
      }
    ];

    const generateTimeline = (status: string, adminId: any) => {
      const now = new Date();
      const baseTimeline = [
        { status: "Pending", comment: "Issue reported by citizen.", updatedBy: adminId, updatedByName: "Admin System", createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000) }
      ];
      
      if (status === "Pending") return baseTimeline;
      
      baseTimeline.push({ status: "Verified", comment: "Inspected by field team. Confirmed.", updatedBy: adminId, updatedByName: "Admin System", createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) });
      if (status === "Verified") return baseTimeline;

      baseTimeline.push({ status: "In Progress", comment: "Repair crew dispatched.", updatedBy: adminId, updatedByName: "Admin System", createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) });
      if (status === "In Progress") return baseTimeline;

      baseTimeline.push({ status: "Resolved", comment: "Issue successfully fixed.", updatedBy: adminId, updatedByName: "Admin System", createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) });
      return baseTimeline;
    };

    const complaintsWithTimeline = complaints.map(c => ({
      ...c,
      timeline: generateTimeline(c.status, adminId)
    }));

    await Complaint.insertMany(complaintsWithTimeline);

    console.log("Seeding Events...");
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const events = [
      {
        title: "City Beach Cleanup",
        description: "Join us this weekend for our monthly beach cleanup. Bags and gloves will be provided. Help keep our shorelines beautiful and safe for marine life.",
        location: "Sunset Beach",
        date: nextWeek,
        image: "https://picsum.photos/seed/beachcleanup/800/600",
        organizer: "Ocean Guardians NGO",
        maxAttendees: 100,
        isActive: true,
        createdBy: adminId,
      },
      {
        title: "Town Hall on Civic Safety",
        description: "An open discussion with the local police chief and mayor regarding the recent spike in neighborhood safety concerns.",
        location: "Community Center Hall",
        date: nextWeek,
        image: "https://picsum.photos/seed/townhall/800/600",
        organizer: "City Council",
        maxAttendees: 200,
        isActive: true,
        createdBy: adminId,
      }
    ];
    await Event.insertMany(events);

    console.log("Seeding Volunteer Opportunities...");
    const volunteers = [
      {
        title: "Elderly Care Assistants",
        description: "We need friendly volunteers to spend time with the elderly at the local nursing home. Activities include reading, playing board games, and walking.",
        category: "Healthcare",
        location: "Sunrise Nursing Home",
        date: nextWeek,
        spotsTotal: 15,
        spotsFilled: 0,
        contactEmail: "volunteer@sunrise.org",
        images: ["https://picsum.photos/seed/elderlycare/800/600"],
        isActive: true,
        createdBy: adminId,
      },
      {
        title: "Park Tree Planting Drive",
        description: "We are planting 500 new saplings in the central park. Volunteers needed for digging, planting, and watering.",
        category: "Tree Plantation",
        location: "Central Park West",
        date: nextWeek,
        spotsTotal: 50,
        spotsFilled: 0,
        contactEmail: "trees@greencity.org",
        images: ["https://picsum.photos/seed/treeplanting/800/600"],
        isActive: true,
        createdBy: adminId,
      }
    ];
    await Volunteer.insertMany(volunteers);

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
};

seedDatabase();
