'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function QRScanPage() {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<any>(null);

  const startScan = async () => {
    if (typeof window === 'undefined') return;
    const { Html5Qrcode } = await import('html5-qrcode');
    const scanner = new Html5Qrcode('qr-reader');
    html5QrRef.current = scanner;
    setScanning(true);

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (text) => {
        setScannedCode(text);
        scanner.stop();
        setScanning(false);
      },
      () => {}
    ).catch((err: Error) => {
      console.error('QR scan error:', err);
      setScanning(false);
    });
  };

  const stopScan = () => {
    html5QrRef.current?.stop();
    setScanning(false);
  };

  useEffect(() => { return () => { html5QrRef.current?.stop().catch(() => {}); }; }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">QR/바코드 스캔</h1>
      <Card>
        <CardHeader><CardTitle>카메라로 스캔</CardTitle></CardHeader>
        <CardContent>
          <div id="qr-reader" ref={scannerRef} className="mb-4 mx-auto max-w-sm" />
          {!scanning ? (
            <Button onClick={startScan} className="w-full">📷 스캔 시작</Button>
          ) : (
            <Button variant="outline" onClick={stopScan} className="w-full">스캔 중지</Button>
          )}
          {scannedCode && (
            <div className="mt-4 rounded-lg bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">스캔 결과:</p>
              <p className="text-lg font-bold text-foreground">{scannedCode}</p>
              <Button size="sm" className="mt-2" onClick={() => window.location.href = `/api/inventory?barcode=${scannedCode}`}>자재 조회</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
