export interface CookieCategoryInfo {
  id: "essential" | "analytics" | "marketing";
  title: string;
  badgeText?: string;
  alwaysOn?: boolean;
  shortDesc: string;
  detailedDesc: string;
  examples: string[];
}

export interface CookieAuditEntry {
  name: string;
  category: "Essential" | "Analytics" | "Marketing";
  purpose: string;
  duration: string;
  provider: string;
}

export const COOKIE_CATEGORIES: CookieCategoryInfo[] = [
  {
    id: "essential",
    title: "Essential",
    badgeText: "Always active",
    alwaysOn: true,
    shortDesc: "Required for core website functionality, security, and consent management.",
    detailedDesc:
      "Essential cookies are strictly necessary to enable basic features such as page navigation, security authentication, and remembering your cookie privacy preferences. The website cannot function properly without these.",
    examples: [
      "Cookie-consent preference storage",
      "Security / session integrity tokens",
      "Authentication state (if accessing admin features)",
    ],
  },
  {
    id: "analytics",
    title: "Analytics",
    badgeText: "Optional",
    alwaysOn: false,
    shortDesc: "Helps us understand how visitors interact with the portfolio to improve experience.",
    detailedDesc:
      "Analytics cookies collect aggregated, anonymous information about how visitors navigate the site, popular pages, referral traffic, and performance metrics. They are only loaded after your explicit consent.",
    examples: [
      "Visitor counts and page view statistics",
      "Popular project case studies and duration",
      "Traffic source breakdown",
      "Performance and layout metrics",
    ],
  },
  {
    id: "marketing",
    title: "Marketing",
    badgeText: "Optional",
    alwaysOn: false,
    shortDesc: "Used if promotional, advertising, or social media tracking features are enabled.",
    detailedDesc:
      "Marketing cookies track visitors across websites to deliver targeted advertising or integrate social sharing platforms. Currently, this portfolio does not run active ad retargeting campaigns.",
    examples: [
      "Retargeting pixels",
      "Social media integration cookies",
      "Ad conversion tracking",
    ],
  },
];

export const COOKIE_AUDIT_TABLE: CookieAuditEntry[] = [
  {
    name: "portfolio_cookie_consent",
    category: "Essential",
    purpose: "Stores user's granular cookie consent preferences (Essential, Analytics, Marketing)",
    duration: "180 days",
    provider: "First-party (meetchetanpura.com)",
  },
  {
    name: "theme",
    category: "Essential",
    purpose: "Remembers user interface color mode (Dark obsidian vs. Light mode)",
    duration: "Persistent / LocalStorage",
    provider: "First-party (meetchetanpura.com)",
  },
  {
    name: "_ga / _gid",
    category: "Analytics",
    purpose: "Collects anonymous statistical data on user website visits (only loaded if Analytics allowed)",
    duration: "2 years / 24 hours (Provider-dependent)",
    provider: "Google Analytics (Third-party)",
  },
  {
    name: "ph_* (PostHog / Vercel Analytics)",
    category: "Analytics",
    purpose: "Measures feature engagement and performance metrics (only loaded if Analytics allowed)",
    duration: "365 days",
    provider: "Analytics Provider",
  },
];
