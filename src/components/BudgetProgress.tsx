
import { Progress } from "@/components/ui/progress";

interface BudgetProgressProps {
  current: number;
  max: number;
  label: string;
}

const BudgetProgress = ({ current, max, label }: BudgetProgressProps) => {
  const percentage = Math.min(Math.round((current / max) * 100), 100);
  const isOverBudget = current > max;
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
        <p className="text-sm font-medium">
          <span className={isOverBudget ? "text-finpal-expense" : "text-foreground"}>
            {current.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </span>
          <span className="text-muted-foreground">
            {" / "}{max.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </span>
        </p>
      </div>
      <Progress 
        value={percentage} 
        className={`h-2 ${isOverBudget ? "bg-gray-100" : "bg-gray-100"}`} 
        indicatorClassName={isOverBudget ? "bg-finpal-expense" : "bg-finpal-purple"} 
      />
    </div>
  );
};

export default BudgetProgress;
