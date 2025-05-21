
import Header from '../components/Header';
import { budgetCategories } from '../data/mockData';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Analytics = () => {
  return (
    <>
      <Header title="Analytics" />
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Budget Overview</h2>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Category Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetCategories.map(budget => {
                const percentage = Math.min(Math.round((budget.spent / budget.limit) * 100), 100);
                const isOverBudget = budget.spent > budget.limit;
                
                return (
                  <div key={budget.id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: budget.category.color }}
                        />
                        <span className="text-sm font-medium">
                          {budget.category.name}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className={isOverBudget ? "text-finpal-expense" : ""}>
                          ${budget.spent.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">
                          {" / $"}{budget.limit.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-2" 
                      indicatorClassName={
                        isOverBudget 
                          ? "bg-finpal-expense" 
                          : percentage > 80 
                          ? "bg-amber-500" 
                          : "bg-finpal-purple"
                      }
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center py-8 text-center">
              <p className="text-muted-foreground">Interactive charts will be available in the next update</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Analytics;
