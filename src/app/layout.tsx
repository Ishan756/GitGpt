import type { Metadata } from "next";
import { ThemeProvider } from 'next-themes';
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import {Header} from "@/components/header";
import { Poppins } from 'next/font/google';

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
    title: "repogpt",
    description: "Talk with your repositories",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html suppressHydrationWarning lang="en">
        <body className={`${poppins.className} antialiased beige-100 text-beige-900 min-h-screen overflow-y-auto`}>
        <ThemeProvider attribute="class">
            <Header />
            <main className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8 lg:pt-20 min-h-[calc(100vh-4rem)]">
                {children}
            </main>
            <Toaster />
        </ThemeProvider>
        </body>
        </html>
    );
}
