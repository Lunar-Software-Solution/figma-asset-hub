import { SocialPlatform } from "@/hooks/useCampaignPosts";

export interface PlatformConfig {
  id: SocialPlatform;
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  maxCharacters: number;
  maxHashtags: number;
  maxMedia: number;
  mediaTypes: string[];
  supportsLinks: boolean;
  linkInBio: boolean;
  icon: string;
}

export const PLATFORM_CONFIGS: Record<SocialPlatform, PlatformConfig> = {
  twitter: {
    id: "twitter",
    label: "X (Twitter)",
    shortLabel: "X",
    color: "#000000",
    bgColor: "bg-black text-white",
    maxCharacters: 280,
    maxHashtags: 5,
    maxMedia: 4,
    mediaTypes: ["image/jpeg", "image/png", "image/gif", "video/mp4"],
    supportsLinks: true,
    linkInBio: false,
    icon: "𝕏",
  },
  facebook: {
    id: "facebook",
    label: "Facebook",
    shortLabel: "FB",
    color: "#1877F2",
    bgColor: "bg-[#1877F2] text-white",
    maxCharacters: 63206,
    maxHashtags: 30,
    maxMedia: 10,
    mediaTypes: ["image/jpeg", "image/png", "image/gif", "video/mp4"],
    supportsLinks: true,
    linkInBio: false,
    icon: "f",
  },
  instagram: {
    id: "instagram",
    label: "Instagram",
    shortLabel: "IG",
    color: "#E4405F",
    bgColor: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white",
    maxCharacters: 2200,
    maxHashtags: 30,
    maxMedia: 10,
    mediaTypes: ["image/jpeg", "image/png", "video/mp4"],
    supportsLinks: false,
    linkInBio: true,
    icon: "📷",
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    shortLabel: "LI",
    color: "#0A66C2",
    bgColor: "bg-[#0A66C2] text-white",
    maxCharacters: 3000,
    maxHashtags: 5,
    maxMedia: 9,
    mediaTypes: ["image/jpeg", "image/png", "image/gif", "video/mp4"],
    supportsLinks: true,
    linkInBio: false,
    icon: "in",
  },
  tiktok: {
    id: "tiktok",
    label: "TikTok",
    shortLabel: "TT",
    color: "#000000",
    bgColor: "bg-black text-white",
    maxCharacters: 2200,
    maxHashtags: 100,
    maxMedia: 1,
    mediaTypes: ["video/mp4"],
    supportsLinks: false,
    linkInBio: true,
    icon: "♪",
  },
  pinterest: {
    id: "pinterest",
    label: "Pinterest",
    shortLabel: "Pin",
    color: "#E60023",
    bgColor: "bg-[#E60023] text-white",
    maxCharacters: 500,
    maxHashtags: 20,
    maxMedia: 1,
    mediaTypes: ["image/jpeg", "image/png"],
    supportsLinks: true,
    linkInBio: false,
    icon: "📌",
  },
  youtube: {
    id: "youtube",
    label: "YouTube",
    shortLabel: "YT",
    color: "#FF0000",
    bgColor: "bg-[#FF0000] text-white",
    maxCharacters: 5000,
    maxHashtags: 15,
    maxMedia: 1,
    mediaTypes: ["video/mp4"],
    supportsLinks: true,
    linkInBio: false,
    icon: "▶",
  },
  threads: {
    id: "threads",
    label: "Threads",
    shortLabel: "TH",
    color: "#000000",
    bgColor: "bg-black text-white",
    maxCharacters: 500,
    maxHashtags: 10,
    maxMedia: 10,
    mediaTypes: ["image/jpeg", "image/png", "image/gif", "video/mp4"],
    supportsLinks: true,
    linkInBio: false,
    icon: "@",
  },
  bluesky: {
    id: "bluesky",
    label: "Bluesky",
    shortLabel: "BS",
    color: "#0085FF",
    bgColor: "bg-[#0085FF] text-white",
    maxCharacters: 300,
    maxHashtags: 10,
    maxMedia: 4,
    mediaTypes: ["image/jpeg", "image/png", "image/gif"],
    supportsLinks: true,
    linkInBio: false,
    icon: "🦋",
  },
};

export function getCharacterLimit(platforms: SocialPlatform[]): number {
  if (platforms.length === 0) return 280; // Default to Twitter limit
  return Math.min(...platforms.map((p) => PLATFORM_CONFIGS[p].maxCharacters));
}

export function getMediaLimit(platforms: SocialPlatform[]): number {
  if (platforms.length === 0) return 4;
  return Math.min(...platforms.map((p) => PLATFORM_CONFIGS[p].maxMedia));
}

export function getHashtagLimit(platforms: SocialPlatform[]): number {
  if (platforms.length === 0) return 5;
  return Math.min(...platforms.map((p) => PLATFORM_CONFIGS[p].maxHashtags));
}
