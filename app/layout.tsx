export const metadata = {
  title: 'Srpska Zemlja',
  description: 'A homeland held in common',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
