'use client';

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import type { CuttingResult } from '@/lib/cutting/guillotine';
import { Button } from '@/components/ui/button';

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica', fontSize: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 12, marginBottom: 20, textAlign: 'center', color: '#666' },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 6, borderBottom: '1 solid #8B6914', paddingBottom: 3 },
  row: { flexDirection: 'row', borderBottom: '0.5 solid #ddd', paddingVertical: 3 },
  headerRow: { flexDirection: 'row', borderBottom: '1 solid #333', paddingVertical: 4, fontWeight: 'bold', backgroundColor: '#f5f0e8' },
  cell: { flex: 1, paddingHorizontal: 4 },
  cellSmall: { width: 60, paddingHorizontal: 4 },
  cellMedium: { width: 80, paddingHorizontal: 4 },
  summary: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, padding: 10, backgroundColor: '#f9f7f2', borderRadius: 4 },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 16, fontWeight: 'bold', color: '#8B6914' },
  summaryLabel: { fontSize: 8, color: '#888', marginTop: 2 },
  footer: { position: 'absolute', bottom: 20, left: 30, right: 30, textAlign: 'center', fontSize: 8, color: '#999' },
});

interface Props {
  result: CuttingResult;
  sheetWidth: number;
  sheetHeight: number;
  sheetPrice?: number;
}

function CuttingDocument({ result, sheetWidth, sheetHeight, sheetPrice }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>재단 지시서</Text>
        <Text style={styles.subtitle}>
          tilea.kr | {new Date().toLocaleDateString('ko-KR')}
        </Text>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{sheetWidth} x {sheetHeight}</Text>
            <Text style={styles.summaryLabel}>원판 규격 (mm)</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{result.sheetsUsed}</Text>
            <Text style={styles.summaryLabel}>필요 원판</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{result.wastePercent}%</Text>
            <Text style={styles.summaryLabel}>자투리율</Text>
          </View>
          {result.totalCost && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{result.totalCost.toLocaleString()}원</Text>
              <Text style={styles.summaryLabel}>총 재료비</Text>
            </View>
          )}
        </View>

        {/* Per-sheet details */}
        {result.layouts.map((layout, sheetIdx) => (
          <View key={sheetIdx} style={styles.section}>
            <Text style={styles.sectionTitle}>
              원판 #{sheetIdx + 1} ({layout.placements.length}개 부재)
            </Text>
            <View style={styles.headerRow}>
              <Text style={styles.cellSmall}>#</Text>
              <Text style={styles.cell}>부재명</Text>
              <Text style={styles.cellMedium}>가로(mm)</Text>
              <Text style={styles.cellMedium}>세로(mm)</Text>
              <Text style={styles.cellMedium}>X 위치</Text>
              <Text style={styles.cellMedium}>Y 위치</Text>
              <Text style={styles.cellSmall}>회전</Text>
            </View>
            {layout.placements.map((p, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.cellSmall}>{i + 1}</Text>
                <Text style={styles.cell}>{p.name}</Text>
                <Text style={styles.cellMedium}>{p.w}</Text>
                <Text style={styles.cellMedium}>{p.h}</Text>
                <Text style={styles.cellMedium}>{p.x}</Text>
                <Text style={styles.cellMedium}>{p.y}</Text>
                <Text style={styles.cellSmall}>{p.rotated ? 'O' : '-'}</Text>
              </View>
            ))}
          </View>
        ))}

        <Text style={styles.footer}>
          이 문서는 tilea.kr 재단 계산기에서 자동 생성되었습니다.
        </Text>
      </Page>
    </Document>
  );
}

export default function CuttingPDFContent(props: Props) {
  return (
    <PDFDownloadLink
      document={<CuttingDocument {...props} />}
      fileName={`재단지시서_${new Date().toISOString().slice(0, 10)}.pdf`}
    >
      {({ loading }) => (
        <Button variant="outline" size="sm" disabled={loading}>
          {loading ? 'PDF 생성 중...' : '📄 PDF 다운로드'}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
