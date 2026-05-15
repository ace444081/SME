import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SME-Pay | Payroll Automation System",
  description:
    "Web-Based Payroll Automation System for Visual Options Engineering and Fabrication Services",
  keywords: [
    "payroll",
    "automation",
    "SME",
    "Visual Options Engineering",
    "fabrication",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
