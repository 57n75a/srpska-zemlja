import Providers from './providers';
import Header from './components/Header';

export const metadata = {
  title: 'Srpska Zemlja',
  description: 'A homeland held in common',
  icons: { icon: '/logo.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
