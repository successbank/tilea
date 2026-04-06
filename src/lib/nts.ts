interface NtsResult {
  valid: boolean;
  status: string;
}

export async function verifyBusinessNumber(businessNumber: string): Promise<NtsResult> {
  if (process.env.NTS_API_KEY) {
    try {
      const res = await fetch(
        'https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=' +
          encodeURIComponent(process.env.NTS_API_KEY),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ b_no: [businessNumber] }),
        }
      );

      if (!res.ok) throw new Error(`NTS API error: ${res.status}`);

      const data = await res.json();
      const item = data.data?.[0];

      if (!item) return { valid: false, status: '조회 결과 없음' };

      return {
        valid: item.b_stt === '계속사업자',
        status: item.b_stt || '알 수 없음',
      };
    } catch (error) {
      console.error('NTS API error:', error);
      return { valid: false, status: 'API 오류' };
    }
  }

  // Development mock
  console.warn(`[DEV] 국세청 API Mock: ${businessNumber} → 계속사업자`);
  return { valid: true, status: '계속사업자' };
}
