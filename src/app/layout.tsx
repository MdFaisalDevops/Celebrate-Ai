import type { Metadata, Viewport } from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import '@/styles/globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '600'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export const metadata: Metadata = {
  title: 'CelebrateAI | GenAI Event Planning Architect for Weddings, Birthdays & Festivals',
  description: 'AI-powered planning assistant that helps you organize weddings, milestone birthdays, and community events with dynamic budgets, timelines, vendor CRM, and personalized creative ideas.',
  keywords: [
    'AI event planner',
    'wedding planner AI',
    'birthday planner AI',
    'community event planner',
    'event budget calculator',
    'run of show timeline',
    'vendor checklist',
    'PromptWars'
  ],
  authors: [{ name: 'CelebrateAI Team' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <body>
        <div className="atmospheric-bg" aria-hidden="true" />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
