import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';
import * as LucideIcons from 'lucide-react';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

const Analytics = () => {
  const { user } = useAuth();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ day: 0, week: 0, month: 0 });
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [daysInMonth, setDaysInMonth] = useState(31);
  const [budget, setBudget] = useState<number | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Calculate start and end dates for the selected month
        const [year, monthNum] = month.split('-').map(Number);
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0);
        setDaysInMonth(endDate.getDate());
        const startDateStr = startDate.toISOString().slice(0, 10);
        const endDateStr = endDate.toISOString().slice(0, 10);

        // Fetch transactions for the user, month, and type, including category
        const { data, error } = await supabase
          .from('transactions')
          .select('*, category:category_id(*)')
          .eq('user_id', user.id)
          .eq('type', type)
          .gte('date', startDateStr)
          .lte('date', endDateStr);
        if (error) throw error;
        setTransactions(data || []);

        // Fetch overall budget for the month (sum of all category budgets)
        const { data: budgetData, error: budgetError } = await supabase
          .from('budget_categories')
          .select('limit_amount')
          .eq('created_by_user_id', user.id)
          .eq('month', month + '-01');
        if (budgetError) throw budgetError;
        const totalBudget = (budgetData || []).reduce((sum: number, b: any) => sum + Number(b.limit_amount), 0);
        setBudget(totalBudget > 0 ? totalBudget : null);

        // Daily totals for area chart
        const daily = Array(endDate.getDate()).fill(0);
        (data || []).forEach((t: any) => {
          const day = new Date(t.date).getDate();
          daily[day - 1] += Number(t.amount);
        });
        // Prepare chart data: { day, expense, budget }
        const dailyBudget = totalBudget > 0 ? totalBudget / endDate.getDate() : 100; // fallback
        const chartArr = daily.map((amount, i) => ({
          day: (i + 1).toString(),
          expense: amount,
          budget: dailyBudget,
        }));
        setChartData(chartArr);

        // Summary stats
        const totalMonth = daily.reduce((a, b) => a + b, 0);
        setSummary({
          day: totalMonth / endDate.getDate() || 0,
          week: totalMonth / 4 || 0,
          month: totalMonth,
        });

        // Category breakdown
        const catMap: Record<string, { name: string; icon: any; color: string; amount: number; count: number; }> = {};
        (data || []).forEach((t: any) => {
          const cat = t.category || { name: 'Uncategorized', color: '#ccc', icon: 'Wallet' };
          const icon = LucideIcons[cat.icon] || LucideIcons.Wallet;
          if (!catMap[cat.name]) {
            catMap[cat.name] = { name: cat.name, icon, color: cat.color, amount: 0, count: 0 };
          }
          catMap[cat.name].amount += Number(t.amount);
          catMap[cat.name].count += 1;
        });
        const catArr = Object.values(catMap).map(c => ({ ...c, percent: totalMonth ? Math.round((c.amount / totalMonth) * 100) : 0 }));
        catArr.sort((a, b) => b.amount - a.amount);
        setCategoryBreakdown(catArr);
      } catch (e) {
        setTransactions([]);
        setChartData([]);
        setSummary({ day: 0, week: 0, month: 0 });
        setCategoryBreakdown([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, month, type]);

  const chartConfig = {
    budget: {
      label: 'Budget',
      color: 'var(--chart-1)',
    },
    expense: {
      label: type === 'expense' ? 'Expense' : 'Income',
      color: 'var(--chart-2)',
    },
  };

  return (
    <>
      <Header title="Analytics" />
      <div className="container mx-auto px-4 py-8">
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <Button
              variant={type === 'expense' ? 'default' : 'outline'}
              onClick={() => setType('expense')}
            >
              Expenses
            </Button>
            <Button
              variant={type === 'income' ? 'default' : 'outline'}
              onClick={() => setType('income')}
            >
              Income
            </Button>
          </div>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="p-2 border rounded"
          />
        </div>

        {/* Area Chart with Budget and Expense/Income */}
        <div className="mb-6">
          <Card>
            <CardContent className="py-8">
              <div className="h-56">
                <ChartContainer config={chartConfig}>
                  <AreaChart
                    data={chartData}
                    margin={{ left: 12, right: 12, top: 16, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value}
                    />
                    <ChartTooltip
                      cursor={{ fill: "var(--muted)" }}
                      content={<ChartTooltipContent indicator="line" formatter={(value: any) => formatCurrency(value)} />}
                    />
                    <Area
                      dataKey="budget"
                      type="monotone"
                      stroke="var(--color-budget)"
                      strokeWidth={2}
                      fill="none"
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    <Area
                      dataKey="expense"
                      type="monotone"
                      fill="var(--color-expense)"
                      fillOpacity={0.18}
                      stroke="var(--color-expense)"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{ r: 4 }}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </AreaChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card><CardContent className="py-4 text-center">Day<br /><span className="font-semibold">{formatCurrency(summary.day)}</span></CardContent></Card>
          <Card><CardContent className="py-4 text-center">Week<br /><span className="font-semibold">{formatCurrency(summary.week)}</span></CardContent></Card>
          <Card><CardContent className="py-4 text-center">Month<br /><span className="font-semibold">{formatCurrency(summary.month)}</span></CardContent></Card>
        </div>

        {/* Category Breakdown */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>By Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {categoryBreakdown.length === 0 && <div className="text-muted-foreground">No data</div>}
                {categoryBreakdown.map((cat, i) => (
                  <div key={cat.name} className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full" style={{ background: cat.color }}>
                      <cat.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{cat.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(cat.amount)}</div>
                      <div className="text-xs text-muted-foreground">{cat.percent}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Analytics;
