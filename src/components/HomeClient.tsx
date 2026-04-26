"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import ComplaintCard from "@/components/ComplaintCard";
import {
  Shield,
  ArrowRight,
  FileText,
  CheckCircle2,
  Users,
  TrendingUp,
  Heart,
  HandHelping,
  CalendarDays,
  AlertTriangle,
  Info,
  Bell,
  Megaphone,
  Globe,
  Mail,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface HomeClientProps {
  complaints: any[];
  analytics: any;
  announcements: any[];
}

export default function HomeClient({
  complaints,
  analytics,
  announcements,
}: HomeClientProps) {
  const container = useRef<HTMLDivElement>(null);

  const alertStyles: Record<string, string> = {
    emergency: "border-red-500/30 bg-red-500/10 text-red-400",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    info: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    update: "border-green-500/30 bg-green-500/10 text-green-400",
  };
  const alertIcons: Record<string, typeof AlertTriangle> = {
    emergency: AlertTriangle,
    warning: Bell,
    info: Info,
    update: Megaphone,
  };

  useGSAP(
    () => {
      // Hero Animation
      const tl = gsap.timeline();

      tl.fromTo(
        ".hero-badge",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.7)" },
      )
        .fromTo(
          ".hero-title .char",
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.05,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.4",
        )
        .fromTo(
          ".hero-desc",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.4",
        )
        .fromTo(
          ".hero-btns a",
          { scale: 0.8, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            stagger: 0.1,
            duration: 0.5,
            ease: "back.out(1.5)",
          },
          "-=0.2",
        );

      // Scroll Animations
      gsap.utils.toArray<HTMLElement>(".reveal-section").forEach((section) => {
        gsap.fromTo(
          section,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      // Staggered Cards (How it works)
      gsap.fromTo(
        ".step-card",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".how-it-works-trigger",
            start: "top 75%",
          },
        },
      );

      // Features Grid
      gsap.fromTo(
        ".feature-card",
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: ".features-trigger",
            start: "top 80%",
          },
        },
      );

      // Team Members
      gsap.fromTo(
        ".team-card",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".team-trigger",
            start: "top 80%",
          },
        },
      );

      // Stats
      gsap.fromTo(
        ".stat-card",
        { y: 30, opacity: 0, rotationX: -20 },
        {
          y: 0,
          opacity: 1,
          rotationX: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".stats-trigger",
            start: "top 85%",
          },
        },
      );

      // Hover effect for hero images
      gsap.utils.toArray<HTMLElement>(".parallax-img").forEach((img) => {
        gsap.to(img, {
          yPercent: -20,
          ease: "none",
          scrollTrigger: {
            trigger: img.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    },
    { scope: container },
  );

  // Helper to split text for character animation
  const splitText = (text: string) => {
    return text.split("").map((char, i) => (
      <span key={i} className="char inline-block">
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  };

  return (
    <div ref={container} className="overflow-hidden">
      {/* Announcements Bar */}
      <section className="relative flex flex-col min-h-[90vh] pb-20 flex items-center justify-center">
        {announcements.filter((a) => a.isPinned).length > 0 && (
          <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 space-y-2 relative z-20">
            {announcements
              .filter((a) => a.isPinned)
              .map((a) => {
                const Icon = alertIcons[a.type] || Info;
                return (
                  <div
                    key={a._id}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 text-sm backdrop-blur-sm",
                      alertStyles[a.type],
                    )}>
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="font-semibold">{a.title}:</span>
                    <span className="opacity-80">{a.content}</span>
                  </div>
                );
              })}
          </div>
        )}

        {/* Hero Section */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-slate-900" />
        <div className="absolute top-20 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

        {/* Abstract decorative elements */}
        <div className="absolute top-1/4 right-10 w-24 h-24 border border-indigo-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
        <div className="absolute bottom-1/4 left-10 w-16 h-16 border border-purple-500/20 rounded-lg rotate-45 animate-[pulse_4s_ease-in-out_infinite]" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-3xl text-left">
              <div className="hero-badge mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20 backdrop-blur-md">
                <Shield className="h-4 w-4" /> Community-Powered Civic Action
              </div>
              <h1 className="hero-title text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-tight">
                {splitText("Report. Track.")}
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {splitText("Resolve.")}
                </span>
              </h1>
              <p className="hero-desc mt-6 text-lg text-slate-400 max-w-xl">
                A modern platform to empower your community. Report civic
                issues, track real-time resolution, volunteer for causes, and
                support campaigns with absolute transparency.
              </p>
              <div className="hero-btns mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/submit"
                  className="btn-primary text-base px-8 py-4 shadow-xl shadow-indigo-500/25 group">
                  Report an Issue{" "}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/complaints"
                  className="btn-secondary text-base px-8 py-4">
                  Browse Issues
                </Link>
              </div>
            </div>

            {/* Hero Images Collage */}
            <div className="hidden lg:block relative h-[600px] w-full">
              <div className="absolute top-0 right-0 w-[80%] h-[60%] rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-10 parallax-img-container">
                <img
                  src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1000&auto=format&fit=crop"
                  alt="Community cleanup"
                  className="parallax-img w-full h-[140%] object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-md backdrop-blur-md font-medium border border-green-500/20">
                      Resolved
                    </span>
                  </div>
                  <p className="font-medium text-sm">
                    Park Cleanup Drive Completed
                  </p>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 w-[65%] h-[55%] rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-20 parallax-img-container">
                <img
                  src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1000&auto=format&fit=crop"
                  alt="Pothole fixing"
                  className="parallax-img w-full h-[140%] object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-md backdrop-blur-md font-medium border border-amber-500/20">
                      In Progress
                    </span>
                  </div>
                  <p className="font-medium text-sm">
                    Main Street Pothole Repair
                  </p>
                </div>
              </div>

              {/* Floating element */}
              <div className="absolute top-[40%] -left-8 bg-slate-800/90 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-xl z-30 flex items-center gap-4 animate-[bounce_5s_ease-in-out_infinite]">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">
                    Active Volunteers
                  </p>
                  <p className="text-lg font-bold text-white">1,200+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {analytics && (
        <section className="relative z-20 -mt-16 stats-trigger">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 perspective-1000">
              {[
                {
                  label: "Issues Reported",
                  value: analytics.totalComplaints,
                  icon: FileText,
                  gradient: "from-indigo-500 to-purple-600",
                },
                {
                  label: "Issues Resolved",
                  value: analytics.resolvedComplaints,
                  icon: CheckCircle2,
                  gradient: "from-green-500 to-emerald-600",
                },
                {
                  label: "In Progress",
                  value: analytics.inProgressComplaints,
                  icon: TrendingUp,
                  gradient: "from-orange-500 to-amber-600",
                },
                {
                  label: "Resolution Rate",
                  value: `${analytics.totalComplaints > 0 ? Math.round((analytics.resolvedComplaints / analytics.totalComplaints) * 100) : 0}%`,
                  icon: Users,
                  gradient: "from-pink-500 to-rose-600",
                },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="stat-card glass-card p-6 text-center transform-gpu transition-all hover:-translate-y-2 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/30">
                  <div
                    className={cn(
                      "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg",
                      stat.gradient,
                    )}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-3xl font-extrabold text-white mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-slate-400">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 how-it-works-trigger reveal-section">
        <div className="text-center mb-16">
          <h2 className="text-indigo-400 font-semibold tracking-wide uppercase text-sm mb-2">
            Platform Workflow
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-white">
            How CivicResolve Works
          </h3>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto text-lg">
            A seamless, transparent process from reporting an issue to its final
            resolution, driven by community effort.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 to-purple-500/0 -translate-y-1/2 z-0" />

          {[
            {
              step: "01",
              title: "Report an Issue",
              desc: "Snap a photo, add location details, and submit your civic issue in seconds.",
              img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop",
            },
            {
              step: "02",
              title: "Community Verification",
              desc: "Authorities and volunteers review the issue, upvote it, and assign resources.",
              img: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=800&auto=format&fit=crop",
            },
            {
              step: "03",
              title: "Track & Resolve",
              desc: "Get real-time updates as the issue moves from pending to successfully resolved.",
              img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="step-card relative z-10 bg-slate-900 rounded-2xl border border-white/5 overflow-hidden group">
              <div className="h-48 overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                />
              </div>
              <div className="p-6 relative">
                <div className="absolute -top-10 right-6 w-12 h-12 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center text-xl font-bold text-indigo-400 shadow-xl">
                  {item.step}
                </div>
                <h4 className="text-xl font-bold text-white mb-2">
                  {item.title}
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Impact Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 reveal-section">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-square rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-3xl absolute inset-0" />
            <div className="relative z-10 grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=600&auto=format&fit=crop"
                alt="Environment"
                className="rounded-2xl shadow-2xl"
              />
              <img
                src="https://images.unsplash.com/photo-1599059813005-11265ba4b4ce?q=80&w=600&auto=format&fit=crop"
                alt="Community"
                className="rounded-2xl shadow-2xl translate-y-8"
              />
            </div>
          </div>
          <div>
            <h2 className="text-indigo-400 font-semibold tracking-wide uppercase text-sm mb-2">
              Our Impact
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Building a better society, together
            </h3>
            <div className="space-y-6 text-slate-400 text-lg">
              <p>
                CivicResolve isn't just about fixing potholes. It's about
                bridging the gap between citizens and authorities to foster a
                culture of transparency, accountability, and collective
                responsibility.
              </p>
              <p>
                By empowering every individual to become an active participant
                in their community's upkeep, we transform passive residents into
                proactive changemakers.
              </p>
              <ul className="space-y-4 mt-8">
                {[
                  "Accelerated issue resolution through crowdsourced reporting",
                  "Data-driven insights for local government planning",
                  "Fostering civic pride and neighborhood collaboration",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-3 w-3 text-indigo-400" />
                    </div>
                    <span className="text-slate-300 text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-24 bg-slate-900/50 border-y border-white/5 features-trigger">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              More Than Just Reporting
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Discover multiple ways to make a tangible difference in your
              community.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Report Issues",
                desc: "Flag potholes, water leaks, safety hazards, and more.",
                icon: FileText,
                href: "/submit",
                color: "from-indigo-500 to-blue-600",
              },
              {
                title: "Donate to Causes",
                desc: "Support campaigns via secure QR code payments.",
                icon: Heart,
                href: "/donate",
                color: "from-rose-500 to-pink-600",
              },
              {
                title: "Volunteer",
                desc: "Join cleanup drives and disaster relief efforts.",
                icon: HandHelping,
                href: "/volunteer",
                color: "from-teal-500 to-emerald-600",
              },
              {
                title: "Attend Events",
                desc: "Participate in community meetups and awareness drives.",
                icon: CalendarDays,
                href: "/events",
                color: "from-purple-500 to-violet-600",
              },
            ].map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="feature-card group glass-card p-8 transition-all duration-300 hover:border-indigo-500/30 hover:bg-slate-800/80">
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br mb-6 shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3",
                    feature.color,
                  )}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
                <div className="mt-6 flex items-center text-sm font-medium text-indigo-400 opacity-0 transform -translate-x-4 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Transparency & Trust Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 reveal-section bg-slate-900/30 border border-white/5 rounded-3xl mb-24">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Radical Transparency
          </h2>
          <p className="mt-4 text-slate-400 text-lg">
            Every report, every status update, and every donation is visible to
            the community. We believe trust is earned through complete openness.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <h4 className="text-xl font-bold text-white mb-3">Open Data</h4>
            <p className="text-slate-400">
              All civic issues are mapped and categorized publicly, preventing
              duplicate reports and ensuring authorities are held accountable.
            </p>
          </div>
          <div className="p-6">
            <h4 className="text-xl font-bold text-white mb-3">
              Verified Updates
            </h4>
            <p className="text-slate-400">
              Status changes require photographic proof and community validation
              before an issue is officially marked as resolved.
            </p>
          </div>
          <div className="p-6">
            <h4 className="text-xl font-bold text-white mb-3">
              Secure Donations
            </h4>
            <p className="text-slate-400">
              Campaign funds are tracked transparently. You can see exactly how
              much has been raised and where the money is going.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 team-trigger reveal-section">
        <div className="text-center mb-16">
          <h2 className="text-indigo-400 font-semibold tracking-wide uppercase text-sm mb-2">
            Our People
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-white">
            The Team Behind CivicResolve
          </h3>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Passionate individuals dedicated to bridging the gap between
            communities and authorities.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-8">
          {[
            {
              name: "Abdul Rafay Khalid",
              role: "24BSSW038",
              img: "https://res.cloudinary.com/dnnh6pyhk/image/upload/f_auto,q_80,w_640,c_limit/v1756875014/abdulrafay_v5ajkw.webp",
            },
            {
              name: "Ahsan Chishti",
              role: "24BSSW052",
              img: "https://res.cloudinary.com/dnnh6pyhk/image/upload/v1756875015/ahsan_ypqxya.webp",
            },
            {
              name: "Ayesha Shaikh",
              role: "24BSSW026",
              img: "https://res.cloudinary.com/dnnh6pyhk/image/upload/f_auto,q_80,w_640,c_limit/v1756875014/ayesha_byhx29.webp",
            },

            {
              name: "Syed Naqi Haider Jafri",
              role: "24BSSW074",
              img: "https://res.cloudinary.com/dnnh6pyhk/image/upload/v1756875015/naqi_bxjrzw.webp",
            },
            {
              name: "Syed Haris Udin",
              role: "24BSSW070",
              img: "https://res.cloudinary.com/dnnh6pyhk/image/upload/f_auto,q_80,w_640,c_limit/v1756875177/24BSSW070_yhlqxq.jpg",
            },
            {
              name: "Saad Shaikh",
              role: "24BSSW098",
              img: "https://res.cloudinary.com/dnnh6pyhk/image/upload/f_auto,q_80,w_640,c_limit/v1756875015/saad_uogypz.webp",
            },
            {
              name: "Abdul Rehman Dakait",
              role: "24BSSW100",
              img: "https://res.cloudinary.com/dnnh6pyhk/image/upload/f_auto,q_80,w_640,c_limit/v1759554528/hitmsacm_profiles/24BSSW100.jpg",
            },
            {
              name: "Ather Ali",
              role: "24BSSW054",
              img: "https://res.cloudinary.com/dnnh6pyhk/image/upload/f_auto,q_80,w_640,c_limit/v1756875183/24BSSW054_fdqxpd.jpg",
            },
            {
              name: "Shahmeer Ali",
              role: "24BSSW094",
              img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            },
          ].map((member, i) => (
            <div key={i} className="team-card group relative">
              <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-slate-800">
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:opacity-80 grayscale group-hover:grayscale-0"
                />
              </div>
              <div className="mt-5 text-center">
                <h4 className="text-lg font-bold text-white">{member.name}</h4>
                <p className="text-sm text-indigo-400">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Complaints */}
      {complaints.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 reveal-section">
          <div className="flex items-end justify-between mb-10 border-b border-white/10 pb-6">
            <div>
              <h2 className="text-3xl font-bold text-white">Recent Issues</h2>
              <p className="text-slate-400 mt-2">
                See what your neighbors are reporting
              </p>
            </div>
            <Link
              href="/complaints"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-4 py-2 rounded-lg transition-colors">
              View All Issues <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {complaints.slice(0, 3).map((c: any) => (
              <div key={c._id} className="transition-all hover:-translate-y-1">
                <ComplaintCard complaint={c} />
              </div>
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/complaints"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 bg-indigo-500/10 px-6 py-3 rounded-xl transition-colors">
              View All Issues <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative overflow-hidden py-24 border-t border-white/5 reveal-section">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 to-purple-900/20" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay" />

        <div className="relative mx-auto max-w-4xl px-4 text-center z-10">
          <h2 className="text-4xl font-extrabold text-white mb-6">
            Ready to make a difference?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join thousands of citizens taking action to improve their
            neighborhoods every day.
          </p>
          <Link
            href="/register"
            className="btn-primary text-lg px-10 py-5 shadow-2xl shadow-indigo-500/30 scale-100 hover:scale-105 transition-transform duration-300">
            Join CivicResolve Today
          </Link>
        </div>
      </section>
    </div>
  );
}
