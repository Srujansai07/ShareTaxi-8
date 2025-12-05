import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Navigation } from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "ShareTaxi - Hyper-Local Carpool & Meetup",
    description: "Connect with neighbors going to the same destination",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="min-h-screen bg-background">
                    {children}
                </div>
                <Toaster position="top-center" richColors />
            </body>
        </html>
    );
}
