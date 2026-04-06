import type { Metadata } from 'next';
import Script from 'next/script';
import { SessionProvider } from '@/components/auth/session-provider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | tilea',
    default: 'tilea - 목공·목재 산업 종합 플랫폼',
  },
  description:
    '재단 계���, 견적 관리, 재고 관리, 커뮤니티, 마켓��레이스까지. 목공·목재 산업을 위한 올인원 SaaS 플랫폼.',
  keywords: ['목공', '목재', '재단계산기', '견적서', '재고관리', '목���커뮤니티'],
  openGraph: {
    title: 'tilea - 목공·목재 산업 종합 플���폼',
    description: '재단 계산, 견적 관리, 재고 관리, 커뮤니티, 마켓플레이스까���.',
    url: 'https://tilea.kr',
    siteName: 'tilea',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <Script
            src={`${process.env.NEXT_PUBLIC_UMAMI_URL || 'https://analytics.tilea.kr'}/script.js`}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
