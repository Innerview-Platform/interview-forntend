export const siteConfig = {
  name: "InnerView",
  tagline: "Mock interviews that level you up.",
  nav: [
    { label: "Practice", href: "/#features" },
    { label: "Mentors", href: "/#features" },
    { label: "Pricing", href: "/#cta" },
    { label: "Resources", href: "/#cta" },
  ],
  routes: {
    home: "/",
    login: "/login",
    signup: "/signup",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    dashboard: "/dashboard",
    profile: "/profile",
  },
} as const;
