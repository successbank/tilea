export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Context {
  params: { id: string };
}

export async function POST(_: Request, { params }: Context) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const estimate = await prisma.estimate.findFirst({
      where: { id: params.id, userId: session.user.id },
      include: { user: { include: { businessProfile: true } } },
    });

    if (!estimate) {
      return NextResponse.json({ error: '견적서를 찾을 수 없습니다' }, { status: 404 });
    }

    if (!estimate.customerEmail) {
      return NextResponse.json({ error: '고객 이메일이 없습니다' }, { status: 400 });
    }

    const items = estimate.items as Array<{
      category: string;
      name: string;
      spec: string;
      quantity: number;
      unitPrice: number;
      amount: number;
    }>;

    const itemsHtml = items
      .map(
        (item, i) =>
          `<tr>
            <td style="padding:8px;border:1px solid #ddd">${i + 1}</td>
            <td style="padding:8px;border:1px solid #ddd">${item.category}</td>
            <td style="padding:8px;border:1px solid #ddd">${item.name}</td>
            <td style="padding:8px;border:1px solid #ddd">${item.spec || '-'}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right">${item.quantity}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right">₩${item.unitPrice.toLocaleString()}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right">₩${item.amount.toLocaleString()}</td>
          </tr>`
      )
      .join('');

    const businessName =
      estimate.user.businessProfile?.shopName ||
      estimate.user.businessProfile?.businessName ||
      estimate.user.name ||
      'tilea';

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#8B6914">견 적 서</h2>
        <p><strong>${businessName}</strong>에서 견적서를 보내드립니다.</p>
        <p>견적번호: ${estimate.estimateNo}</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead>
            <tr style="background:#f5f0e8">
              <th style="padding:8px;border:1px solid #ddd">#</th>
              <th style="padding:8px;border:1px solid #ddd">카테고리</th>
              <th style="padding:8px;border:1px solid #ddd">품명</th>
              <th style="padding:8px;border:1px solid #ddd">규격</th>
              <th style="padding:8px;border:1px solid #ddd">수량</th>
              <th style="padding:8px;border:1px solid #ddd">단가</th>
              <th style="padding:8px;border:1px solid #ddd">금액</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p><strong>소계:</strong> ₩${estimate.subtotal.toLocaleString()}</p>
        <p><strong>마진(${estimate.marginRate}%):</strong> ₩${estimate.marginAmount.toLocaleString()}</p>
        <p style="font-size:18px"><strong>합계: ₩${estimate.totalAmount.toLocaleString()}</strong></p>
        ${estimate.notes ? `<p><strong>비고:</strong> ${estimate.notes}</p>` : ''}
        <hr>
        <p style="color:#888;font-size:12px">이 견적서는 tilea.kr에서 발송되었습니다.</p>
      </div>
    `;

    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: `${businessName} <noreply@tilea.kr>`,
        to: estimate.customerEmail,
        subject: `[견적서] ${estimate.estimateNo} - ${businessName}`,
        html,
      });
    } else {
      console.warn(`[DEV] 견적서 이메일 발송: ${estimate.customerEmail}`);
      console.warn(`[DEV] 견적번호: ${estimate.estimateNo}`);
    }

    await prisma.estimate.update({
      where: { id: params.id },
      data: { status: 'SENT' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Estimate send error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
