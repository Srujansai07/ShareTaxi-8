import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "ShareTaxi - Hyper-Local Ride Sharing",
    description: "Connect with neighbors, share rides, save money and reduce carbon emissions",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.Node;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                {children}
                <Toaster position="top-center" richColors />
            </body>
        </html>
    );
}
