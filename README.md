# CivicResolve — Civic Issue Reporting & Resolution Platform

CivicResolve is a comprehensive, community-driven platform designed to empower citizens to report local civic issues, track their resolution, and engage in community building through volunteering, events, and transparent donations. 

The platform connects citizens directly with local authorities and NGOs, ensuring transparency and accountability.

## 🚀 Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Actions)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Database:** [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Authentication:** [Auth.js (NextAuth beta)](https://authjs.dev/) with Credentials strategy
*   **Media Storage:** [Cloudinary](https://cloudinary.com/) (for robust image handling and optimization)
*   **Email Notifications:** [Resend](https://resend.com/)
*   **Validation:** [Zod](https://zod.dev/)
*   **Icons:** [Lucide React](https://lucide.dev/)

## 🌟 Key Features

### 1. Civic Issue Reporting
*   **Report Issues:** Citizens can report issues (Road, Water, Electricity, Garbage, Safety, etc.) with descriptions, geo-location data, and image uploads.
*   **Anonymity:** Option to submit complaints anonymously.
*   **Tracking Timeline:** Every complaint has a timeline showing state transitions (Pending → Verified → In Progress → Resolved) and updates from authorities.
*   **Community Upvotes:** Citizens can upvote severe issues to increase visibility.

### 2. Community Funding (Donation Campaigns)
*   **QR-Code Based Donations:** A robust, zero-fee donation system where admins post campaigns with their UPI or Bank QR codes.
*   **Manual Verification:** Donors scan the code, pay externally, and submit their Transaction ID and payment screenshot as proof.
*   **Transparency:** Admins manually verify transaction proofs from the dashboard, which then updates the campaign's raised amount progress bar.

### 3. Community Engagement
*   **Announcements:** Critical alerts and updates (Emergency, Warning, Info) that pin to the top of the homepage.
*   **Volunteer Board:** Opportunities for citizens to join cleanup drives, teaching initiatives, and disaster relief efforts.
*   **Community Events:** Listings for town halls, workshops, and community meetups.

### 4. Role-Based Unified Dashboard
A comprehensive sidebar-navigation dashboard tailored to the logged-in user's role:
*   **Admin:** Full control. Manage all complaints, users, campaigns, verify donation transactions, post announcements, and create volunteer/event listings.
*   **Authority / NGO:** View assigned issues, update issue statuses, upload proof of resolution, and manage community events.
*   **User:** View personal issue reports.

---

## 🛠️ Local Development Setup

### Prerequisites
*   Node.js (v18+)
*   MongoDB instance (local or Atlas)
*   Cloudinary Account
*   Resend Account (for emails)

### 1. Clone & Install
```bash
git clone <repository-url>
cd <project-directory>
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory and add the following keys:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/civic-platform

# Authentication
# Generate a secret using: npx auth secret or openssl rand -base64 32
AUTH_SECRET=your_auth_secret_here

# Cloudinary (Media Uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Resend (Email Notifications)
RESEND_API_KEY=your_resend_api_key

# App URL (For email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Seed the Database
To quickly populate the database with sample users, complaints, campaigns, and events, run the seed script:

```bash
npx tsx src/scripts/seed.ts
```

**Seed Test Accounts:**
*   **Admin:** `admin@civic.com` / `Password123`
*   **User:** `john@civic.com` / `Password123`
*   **Authority:** `road@authority.com` / `Password123`
*   **NGO:** `water@ngo.com` / `Password123`

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📂 Project Structure

```text
src/
├── actions/         # Next.js Server Actions (Database operations)
│   ├── community.ts # Logic for Events, Volunteers, Announcements
│   ├── complaints.ts# Logic for Complaints, User Management, Analytics
│   └── donations.ts # Logic for Campaigns and Transaction proofs
├── app/             # App Router pages and layouts
│   ├── api/         # API Routes (Auth, Cloudinary upload)
│   ├── dashboard/   # Unified Role-based Dashboard
│   ├── donate/      # Donation campaigns frontend
│   ├── events/      # Events frontend
│   ├── volunteer/   # Volunteer board frontend
│   └── complaints/  # Complaint browsing and details
├── components/      # Reusable UI components (Navbar, Footer, Cards)
├── lib/             # Utility functions, DB connection, Auth config, Zod schemas
├── models/          # Mongoose Database Models
├── scripts/         # Utility scripts (seeding)
└── types/           # TypeScript interface definitions
```

## 🔒 Security & Best Practices
*   **Server Actions:** All database mutations are handled securely on the server via Next.js Server Actions.
*   **Zod Validation:** Strict input validation for all forms and server actions.
*   **Role Checks:** Both frontend routing and backend server actions strictly verify user roles (`admin`, `ngo`, `authority`, `user`) before allowing operations.
*   **Lean Queries:** Mongoose queries use `.lean()` for massive performance gains when rendering server components.

## 📄 License
This project is licensed under the MIT License.
