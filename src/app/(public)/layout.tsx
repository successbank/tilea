import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">{children}</main>
    </div>
  );
}
