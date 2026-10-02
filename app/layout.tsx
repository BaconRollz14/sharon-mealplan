import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sharon Meal Plan | Four-week meal planner",
  description: "Sharon's four-week dinner plan, with complete recipes, portion guides and organised weekly shopping lists.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Sharon Meal Plan",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

const themeScript = `(() => {
  try {
    const saved = JSON.parse(localStorage.getItem("mealplan-local-state-v1") || "null");
    const dark = saved?.theme === "dark" || (saved?.theme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  } catch {}
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f1eadf" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#171311" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
