import type { Metadata } from "next";
import { ClerkProvider, Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import MenuNavigation from "@/components/layout/navigation";

const geistMonoHeading = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-heading",
});

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meal-prep helper",
  description:
    "A meal-prep helper app built with Next.js, Prisma, and Clerk for authentication.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("font-sans", geist.variable, geistMonoHeading.variable)}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        suppressHydrationWarning
      >
        <ClerkProvider>
          <header
            className="py-4 h-16 container px-4 mx-auto"
            suppressHydrationWarning
          >
            <Show when="signed-out">
              <div className="flex justify-end items-center gap-4">
                <SignInButton />
                <SignUpButton>
                  <button className="bg-purple-700 text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </Show>
            <Show when="signed-in">
              <MenuNavigation />
            </Show>
          </header>
          <div className="container my-12 mx-auto">{children}</div>
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
