
export interface ExpenditureItem {
  id: string;
  name: string;
  amount: number;
  remark: string;
}

export interface BudgetInputs {
  totalIncome: number;
  actualExpenditure: number;
  estimatedItems: ExpenditureItem[];
}

export interface BudgetMetrics {
  totalEstimatedFuture: number;
  totalProjectedExpenditure: number;
  currentSpentPercentage: number;
  projectedTotalPercentage: number;
  remainingBudget: number;
  isOverBudget: boolean;
}

export interface InsightReport {
  analysis: string;
  recommendations: string[];
  status: 'Healthy' | 'Warning' | 'Critical';
}
