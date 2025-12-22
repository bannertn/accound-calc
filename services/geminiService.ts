
import { GoogleGenAI, Type } from "@google/genai";
import { BudgetInputs, BudgetMetrics } from "../types";

export const getFinancialInsights = async (inputs: BudgetInputs, metrics: BudgetMetrics) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    As a senior financial auditor, analyze the following budget data for a professional accounting system:
    
    Income: ${inputs.totalIncome}
    Already Spent: ${inputs.actualExpenditure} (${metrics.currentSpentPercentage.toFixed(2)}%)
    
    Future Estimates:
    - Personnel: ${inputs.personnelCosts}
    - Office: ${inputs.officeCosts}
    - Business: ${inputs.businessCosts}
    - Maintenance: ${inputs.maintenanceCosts}
    - Procurement: ${inputs.procurementCosts}
    - Others: ${inputs.otherCosts}
    
    Projected Total Spending: ${metrics.totalProjectedExpenditure} (${metrics.projectedTotalPercentage.toFixed(2)}% of income)
    Remaining Balance: ${metrics.remainingBudget}
    
    Provide a professional assessment including:
    1. A detailed analysis of the spending patterns.
    2. Specific recommendations to optimize the budget.
    3. A risk status (Healthy, Warning, or Critical).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            recommendations: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            status: { 
              type: Type.STRING,
              description: "One of: Healthy, Warning, Critical"
            }
          },
          required: ["analysis", "recommendations", "status"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Insight Error:", error);
    return {
      analysis: "無法生成即時分析。請檢查預算數據是否合理。",
      recommendations: ["建議定期審查各項支出", "維持健康的現金儲備"],
      status: "Warning"
    };
  }
};
