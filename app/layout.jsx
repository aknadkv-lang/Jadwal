import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata = {
  title: "Ruang Kuliah | Pengingat Jadwal & Tugas",
  description: "Frontend pengelola jadwal kuliah dan tugas.",
};

export default function RootLayout({ children }) {
  return <html lang="id"><body className={`${dmSans.variable} ${jakarta.variable}`}>{children}</body></html>;
}
