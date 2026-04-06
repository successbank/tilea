'use client';

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import type { EstimateData } from './estimate-pdf';

const s = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 9 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 5, letterSpacing: 8 },
  subtitle: { fontSize: 10, textAlign: 'center', color: '#666', marginBottom: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  infoBlock: { width: '48%' },
  infoLabel: { fontSize: 8, color: '#888', marginBottom: 2 },
  infoValue: { fontSize: 10, marginBottom: 6 },
  totalBanner: { backgroundColor: '#f5f0e8', padding: 12, borderRadius: 4, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalText: { fontSize: 9 },
  totalAmount: { fontSize: 16, fontWeight: 'bold', color: '#8B6914' },
  table: { marginBottom: 15 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#8B6914', paddingVertical: 5, paddingHorizontal: 4 },
  tableHeaderCell: { color: 'white', fontSize: 8, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', borderBottom: '0.5 solid #ddd', paddingVertical: 4, paddingHorizontal: 4 },
  tableRowAlt: { flexDirection: 'row', borderBottom: '0.5 solid #ddd', paddingVertical: 4, paddingHorizontal: 4, backgroundColor: '#fafaf5' },
  cellNo: { width: 25 },
  cellCat: { width: 55 },
  cellName: { width: 120 },
  cellSpec: { width: 90 },
  cellQty: { width: 40, textAlign: 'right' },
  cellPrice: { width: 70, textAlign: 'right' },
  cellAmount: { width: 80, textAlign: 'right' },
  summarySection: { marginTop: 5, alignItems: 'flex-end' },
  summaryRow: { flexDirection: 'row', width: 200, justifyContent: 'space-between', paddingVertical: 3 },
  summaryLabel: { fontSize: 9, color: '#666' },
  summaryValue: { fontSize: 9, fontWeight: 'bold' },
  summaryTotal: { flexDirection: 'row', width: 200, justifyContent: 'space-between', paddingVertical: 5, borderTop: '1 solid #8B6914', marginTop: 3 },
  summaryTotalLabel: { fontSize: 11, fontWeight: 'bold' },
  summaryTotalValue: { fontSize: 11, fontWeight: 'bold', color: '#8B6914' },
  notes: { marginTop: 15, padding: 10, backgroundColor: '#f9f7f2', borderRadius: 4 },
  notesLabel: { fontSize: 8, color: '#888', marginBottom: 3 },
  notesText: { fontSize: 9 },
  footer: { position: 'absolute', bottom: 25, left: 40, right: 40, textAlign: 'center', fontSize: 7, color: '#aaa' },
});

const fmt = (n: number) => n.toLocaleString();

function EstimateDocument({ data }: { data: EstimateData }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.title}>견 적 서</Text>
        <Text style={s.subtitle}>Estimate</Text>

        {/* Info */}
        <View style={s.infoRow}>
          <View style={s.infoBlock}>
            <Text style={s.infoLabel}>수신</Text>
            <Text style={s.infoValue}>{data.customerName} 귀하</Text>
            {data.customerPhone && (
              <>
                <Text style={s.infoLabel}>연락처</Text>
                <Text style={s.infoValue}>{data.customerPhone}</Text>
              </>
            )}
            {data.customerAddress && (
              <>
                <Text style={s.infoLabel}>주소</Text>
                <Text style={s.infoValue}>{data.customerAddress}</Text>
              </>
            )}
          </View>
          <View style={s.infoBlock}>
            <Text style={s.infoLabel}>견적번호</Text>
            <Text style={s.infoValue}>{data.estimateNo}</Text>
            <Text style={s.infoLabel}>작성일</Text>
            <Text style={s.infoValue}>{new Date().toLocaleDateString('ko-KR')}</Text>
            {data.validUntil && (
              <>
                <Text style={s.infoLabel}>유효기간</Text>
                <Text style={s.infoValue}>{new Date(data.validUntil).toLocaleDateString('ko-KR')}</Text>
              </>
            )}
            {data.businessName && (
              <>
                <Text style={s.infoLabel}>발신</Text>
                <Text style={s.infoValue}>{data.businessName}</Text>
              </>
            )}
          </View>
        </View>

        {/* Total banner */}
        <View style={s.totalBanner}>
          <Text style={s.totalText}>아래와 같이 견적합니다.</Text>
          <Text style={s.totalAmount}>{fmt(data.totalAmount)} 원</Text>
        </View>

        {/* Items table */}
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={{ ...s.tableHeaderCell, ...s.cellNo }}>No</Text>
            <Text style={{ ...s.tableHeaderCell, ...s.cellCat }}>카테고리</Text>
            <Text style={{ ...s.tableHeaderCell, ...s.cellName }}>품명</Text>
            <Text style={{ ...s.tableHeaderCell, ...s.cellSpec }}>규격</Text>
            <Text style={{ ...s.tableHeaderCell, ...s.cellQty }}>수량</Text>
            <Text style={{ ...s.tableHeaderCell, ...s.cellPrice }}>단가</Text>
            <Text style={{ ...s.tableHeaderCell, ...s.cellAmount }}>금액</Text>
          </View>
          {data.items.map((item, i) => (
            <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
              <Text style={s.cellNo}>{i + 1}</Text>
              <Text style={s.cellCat}>{item.category}</Text>
              <Text style={s.cellName}>{item.name}</Text>
              <Text style={s.cellSpec}>{item.spec || '-'}</Text>
              <Text style={s.cellQty}>{item.quantity}</Text>
              <Text style={s.cellPrice}>{fmt(item.unitPrice)}</Text>
              <Text style={s.cellAmount}>{fmt(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={s.summarySection}>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>소계</Text>
            <Text style={s.summaryValue}>{fmt(data.subtotal)} 원</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>마진 ({data.marginRate}%)</Text>
            <Text style={s.summaryValue}>{fmt(data.marginAmount)} 원</Text>
          </View>
          <View style={s.summaryTotal}>
            <Text style={s.summaryTotalLabel}>합계</Text>
            <Text style={s.summaryTotalValue}>{fmt(data.totalAmount)} 원</Text>
          </View>
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={s.notes}>
            <Text style={s.notesLabel}>비고</Text>
            <Text style={s.notesText}>{data.notes}</Text>
          </View>
        )}

        <Text style={s.footer}>
          이 견적서는 tilea.kr에서 자동 생성되었습니다. | {data.estimateNo}
        </Text>
      </Page>
    </Document>
  );
}

export default function EstimatePDFContent({ data }: { data: EstimateData }) {
  return (
    <PDFDownloadLink
      document={<EstimateDocument data={data} />}
      fileName={`견적서_${data.estimateNo}.pdf`}
    >
      {({ loading }) => (
        <Button variant="outline" size="sm" disabled={loading}>
          {loading ? 'PDF 생성 중...' : '📄 PDF 다운로드'}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
