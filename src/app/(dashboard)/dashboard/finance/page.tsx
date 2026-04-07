export const dynamic = 'force-dynamic';
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const LineChart = dynamic(() => import('recharts').then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then((m) => m.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((m) => m.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then((m) => m.Cell), { ssr: false });

const COLORS = ['#8B6914', '#D4A843', '#2E7D32', '#DC2626', '#6366F1', '#F59E0B'];

export default function FinanceDashboard() {
  const [data, setData] = useState<{ expenses: Array<{ type: string; category: string; amount: number; date: string }>; totals: { income: number; expense: number } }>({ expenses: [], totals: { income: 0, expense: 0 } });

  useEffect(() => { fetch('/api/expenses').then((r) => r.json()).then(setData); }, []);

  const monthlyData = data.expenses.reduce<Record<string, { month: string; income: number; expense: number }>>((acc, e) => {
    const month = e.date.slice(0, 7);
    if (!acc[month]) acc[month] = { month, income: 0, expense: 0 };
    if (e.type === 'INCOME') acc[month].income += e.amount;
    else acc[month].expense += e.amount;
    return acc;
  }, {});
  const chartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  const categoryData = data.expenses.filter((e) => e.type === 'EXPENSE').reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">매출 대시보드</h1>
      <div className="mb-6 grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-green-600">₩{data.totals.income.toLocaleString()}</p><p className="text-xs text-muted">총 수입</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-red-600">₩{data.totals.expense.toLocaleString()}</p><p className="text-xs text-muted">총 지출</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-foreground">₩{(data.totals.income - data.totals.expense).toLocaleString()}</p><p className="text-xs text-muted">순이익</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-6 desktop:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>월별 매출/지출 추이</CardTitle></CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="income" stroke="#2E7D32" name="수입" />
                  <Line type="monotone" dataKey="expense" stroke="#DC2626" name="지출" />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="py-10 text-center text-muted">데이터가 없습니다</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>지출 카테고리 비율</CardTitle></CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="py-10 text-center text-muted">지출 데이터가 없습니다</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
