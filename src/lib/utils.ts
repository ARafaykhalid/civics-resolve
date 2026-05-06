import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind CSS classes without conflicts */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date to a human-readable string */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Format a date with time */
export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Format currency amount */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100);
}

/** Calculate donation progress percentage */
export function calcProgress(raised: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(Math.round((raised / goal) * 100), 100);
}

/** Generate a random color for avatars */
export function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-red-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/** Truncate text to a specified length */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

/** Get status color */
export function getStatusColor(status: string): string {
  switch (status) {
    case "Pending Verification":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Verified":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Under Progress":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "In Progress":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "Resolved":
      return "bg-green-100 text-green-800 border-green-200";
    case "Rejected":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

/** Get priority color */
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "High":
      return "bg-red-100 text-red-800 border-red-200";
    case "Medium":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Low":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

/** Get category icon name (for lucide-react) */
export function getCategoryIcon(category: string): string {
  switch (category) {
    case "Road":
      return "route";
    case "Water":
      return "droplets";
    case "Electricity":
      return "zap";
    case "Garbage":
      return "trash-2";
    case "Safety":
      return "shield-alert";
    default:
      return "circle-help";
  }
}
