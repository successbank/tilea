import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | tilea',
    default: 'tilea - 목공·목재 산업 종합 플랫폼',
  },
  description:
    '재단 계산, 견적 관리, 재고 관리, 커뮤니티, 마켓플레이스까지. 목공·목재 산업을 위한 올인원 SaaS 플랫폼.',
  keywords: ['목공', '목재', '재단계산기', '견적서', '재고관리', '목공커뮤니티'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
