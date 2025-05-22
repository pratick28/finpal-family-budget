import { useEffect, useState, useMemo } from 'react';
import Header from '../components/Header';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '../integrations/supabase/client';

const Analytics = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchAccount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: memberships } = await (supabase as any)
        .from('account_members')
        .select('account_id')
        .eq('user_id', user.id)
        .limit(1);
      if (memberships && memberships.length > 0) {
        setAccountId(memberships[0].account_id);
      }
    };
    fetchAccount();
  }, []);

  useEffect(() => {
    if (accountId) fetchData();
    // eslint-disable-next-line
  }, [accountId, month]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    // Fetch categories
    const { data: catData, error: catError } = await (supabase as any)
      .from('categories')
      .select('*')
      .eq('account_id', accountId)
      .order('name');
    // Fetch budgets for the selected month
    const { data: budgetData, error: budgetError } = await (supabase as any)
      .from('budget_categories')
      .select('*')
      .eq('account_id', accountId)
      .eq('month', month + '-01');
    // Fetch transactions for the selected month
    const { data: txData, error: txError } = await (supabase as any)
      .from('transactions')
      .select('*')
      .eq('account_id', accountId)
      .gte('date', month + '-01')
      .lte('date', month + '-31');
    if (catError || budgetError || txError) setError(catError?.message || budgetError?.message || txError?.message);
    setCategories(catData || []);
    setBudgets(budgetData || []);
    setTransactions(txData || []);
    setLoading(false);
  };

  // Calculate spent per category
  const getSpent = (categoryId: string) => {
    return transactions
      .filter((t: any) => t.category_id === categoryId && t.type === 'expense')
      .reduce((acc: number, t: any) => acc + Number(t.amount), 0);
  };

  // Prepare daily spending data for the chart
  const daysInMonth = useMemo(() => {
    const [year, monthNum] = month.split('-').map(Number);
    return new Date(year, monthNum, 0).getDate();
  }, [month]);

  const dailySpending = useMemo(() => {
    const arr = Array(daysInMonth).fill(0);
    transactions.forEach((t: any) => {
      if (t.type !== 'expense') return;
      if (selectedCategory !== 'all' && t.category_id !== selectedCategory) return;
      const day = new Date(t.date).getDate();
      arr[day - 1] += Number(t.amount);
    });
    return arr;
  }, [transactions, daysInMonth, selectedCategory]);

  return (
    <>
      <Header title="Analytics" />
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <h2 className="text-lg font-semibold mr-4">Budget Overview</h2>
          <input
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Category Spending</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="space-y-4">
                {budgets.map(budget => {
                  const category = categories.find(c => c.id === budget.category_id);
                  if (!category) return null;
                  const spent = getSpent(budget.category_id);
                  const percentage = budget.limit_amount > 0 ? Math.min(Math.round((spent / budget.limit_amount) * 100), 100) : 0;
                  const isOverBudget = spent > budget.limit_amount;
                  return (
                    <div key={budget.id} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm font-medium">
                            {category.name}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className={isOverBudget ? "text-finpal-expense" : ""}>
                            ${spent.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">
                            {" / $"}{Number(budget.limit_amount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="relative w-full h-2 bg-gray-100 rounded overflow-hidden">
                        <div
                          className={`absolute left-0 top-0 h-2 rounded transition-all duration-300 ${
                            isOverBudget
                              ? 'bg-finpal-expense'
                              : percentage > 80
                              ? 'bg-amber-500'
                              : 'bg-finpal-purple'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {(() => {
                // Prepare data for grouped bar chart
                const chartData = categories.map(cat => {
                  const budget = budgets.find(b => b.category_id === cat.id)?.limit_amount || 0;
                  const expense = transactions
                    .filter((t: any) => t.category_id === cat.id && t.type === 'expense')
                    .reduce((acc: number, t: any) => acc + Number(t.amount), 0);
                  return {
                    id: cat.id,
                    name: cat.name,
                    color: cat.color,
                    budget: Number(budget),
                    expense: expense,
                  };
                });
                const maxValue = Math.max(1, ...chartData.map(d => Math.max(d.budget, d.expense)));
                const barWidth = 18;
                const groupWidth = 48;
                const chartHeight = 140;
                const chartWidth = Math.max(400, chartData.length * groupWidth + 60);
                return (
                  <div className="relative">
                    <svg width={chartWidth} height={chartHeight}>
                      {/* Y axis grid line */}
                      <line x1="50" y1="20" x2={chartWidth - 10} y2="20" stroke="#e5e7eb" strokeDasharray="4 2" />
                      {/* Bars */}
                      {chartData.map((cat, i) => {
                        const x = 50 + i * groupWidth;
                        const budgetHeight = (cat.budget / maxValue) * 90;
                        const expenseHeight = (cat.expense / maxValue) * 90;
                        return (
                          <g key={cat.id}>
                            {/* Budget bar */}
                            <rect
                              x={x}
                              y={110 - budgetHeight}
                              width={barWidth}
                              height={budgetHeight}
                              fill="#9B87F5" // finpal-purple
                              rx={4}
                            />
                            {/* Expense bar */}
                            <rect
                              x={x + barWidth + 4}
                              y={110 - expenseHeight}
                              width={barWidth}
                              height={expenseHeight}
                              fill="#FF5252" // finpal-expense
                              rx={4}
                            />
                            {/* Category name */}
                            <text
                              x={x + barWidth + 2}
                              y={128}
                              fontSize="11"
                              textAnchor="middle"
                              fill="#444"
                              style={{ fontWeight: 500 }}
                              transform={`rotate(-30 ${x + barWidth + 2},128)`}
                            >{cat.name}</text>
                            {/* Budget value */}
                            {cat.budget > 0 && (
                              <text
                                x={x + barWidth / 2}
                                y={110 - budgetHeight - 6}
                                fontSize="10"
                                textAnchor="middle"
                                fill="#9B87F5"
                                fontWeight="bold"
                              >{cat.budget}</text>
                            )}
                            {/* Expense value */}
                            {cat.expense > 0 && (
                              <text
                                x={x + barWidth + 4 + barWidth / 2}
                                y={110 - expenseHeight - 6}
                                fontSize="10"
                                textAnchor="middle"
                                fill="#FF5252"
                                fontWeight="bold"
                              >{cat.expense}</text>
                            )}
                          </g>
                        );
                      })}
                      {/* Y axis label */}
                      <text x="10" y="70" fontSize="12" textAnchor="middle" fill="#888" transform="rotate(-90 10,70)">Amount</text>
                    </svg>
                    {/* Legend */}
                    <div className="flex gap-4 mt-2 ml-12">
                      <div className="flex items-center gap-1"><span className="inline-block w-4 h-3 rounded" style={{ background: '#9B87F5' }}></span> <span className="text-xs">Budget</span></div>
                      <div className="flex items-center gap-1"><span className="inline-block w-4 h-3 rounded" style={{ background: '#FF5252' }}></span> <span className="text-xs">Expense</span></div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Analytics;
