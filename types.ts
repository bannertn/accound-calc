
export interface BudgetInputs {
  totalIncome: number;
  actualExpenditure: number;
  personnelCosts: number;
  officeCosts: number;
  businessCosts: number;
  maintenanceCosts: number;
  procurementCosts: number;
  otherCosts: number;
  remarks: {
    personnel: string;
    office: string;
    business: string;
    maintenance: string;
    procurement: string;
    other: string;
  };
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
