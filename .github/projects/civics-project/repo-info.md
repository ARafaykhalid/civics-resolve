# Civics Community Platform - Civic Engagement & Issue Reporting Portal - Repository Information

## GitHub Short Description (299 / 300 Characters Max)

> Civics Community Platform is a civic engagement app built with Next.js 16, React 19, NextAuth v5, MongoDB, GSAP, Leaflet maps, and Cloudinary. It enables citizens to report local infrastructure issues, track resolution progress on interactive maps, vote on community proposals, and verify QR badges.

---

## Detailed Project Analysis & Engineering Overview

Civics Community Platform was built to solve the systemic disconnect between urban residents and local municipal authorities regarding public infrastructure maintenance (such as potholes, streetlights, and waste accumulation). Citizens needed a transparent tool to report hazards and track resolution progress.

Built with Next.js 16, React 19, NextAuth v5, and MongoDB Mongoose 9, the portal integrates an interactive Leaflet geospatial map where users can pin issue locations, upload photo evidence via Cloudinary, and monitor repair statuses. Citizens can upvote critical community reports and verify status changes via QR badges.

Managing high-resolution image uploads from mobile devices in low-bandwidth areas presented a major bottleneck. The team implemented client-side image compression alongside Next-Cloudinary transformations to ensure instant file uploads before saving geospatial metadata to MongoDB.

---

## GitHub Topics / Tags

`nextjs`, `react19`, `typescript`, `tailwindcss`, `nextauth`, `mongodb`, `mongoose`, `gsap`, `leaflet`, `cloudinary`, `civic-tech`, `community-platform`, `modern-web`

---

## Detailed Tech Stack & Micro-Libraries

- **Core Framework**: Next.js 16 (App Router)
- **Ui Library**: React 19 & React DOM 19
- **Language**: TypeScript 5
- **Authentication**: NextAuth v5 (@auth/mongodb-adapter, bcryptjs)
- **Database And Odm**: MongoDB & Mongoose 9
- **Interactive Mapping**: Leaflet & React Leaflet
- **Animations**: GSAP 3 (@gsap/react)
- **Cloud Media**: Cloudinary & Next Cloudinary
- **Email And Qr**: Resend API & QRCode (qrcode)
- **Validation And Dates**: Zod 4 & date-fns
- **Styling And Icons**: Tailwind CSS v4, Lucide React, clsx, tailwind-merge
