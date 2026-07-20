import type { Metadata } from 'next';
import { Barlow_Condensed, Barlow } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Providers from '@/components/Providers';
import CosmicTopography from '@/components/CosmicTopography';

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-bc',
  display: 'swap',
});

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-b',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'F1 Dash — Ultimate Formula 1 Hub',
  description: 'Live F1 timing tower, race countdown, points standings, driver profiles and complete Formula 1 history in one stunning dashboard.',
  keywords: 'F1, Formula 1, live timing, race results, standings, drivers',
  openGraph: {
    title: 'F1 Dash — Ultimate Formula 1 Hub',
    description: 'Live F1 timing, standings, drivers and history.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${barlow.variable}`}>
      <body>
        <Providers>
          <CosmicTopography />
          <Navbar />
          <main style={{ position: 'relative', zIndex: 1 }}>{children}</main>
          <footer className="footer" style={{ position: 'relative', zIndex: 1 }}>
            F1 DASH &mdash; Data sourced from{' '}
            <a href="https://openf1.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>OpenF1</a>
            {' '}& <a href="https://jolpi.ca/ergast" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Jolpica</a>
            {' '}· Not affiliated with Formula 1
          </footer>
        </Providers>
      </body>
    </html>
  );
}
