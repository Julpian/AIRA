import "./globals.css";

export const metadata = {
  title: "AIRA System",
  description: "AIRA System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}