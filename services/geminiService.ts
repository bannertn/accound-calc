
import { GoogleGenAI, Type } from "@google/genai";
import { BudgetInputs, BudgetMetrics } from "../types";

export const getFinancialInsights = async (inputs: BudgetInputs, metrics: BudgetMetrics) => {
  // Initialize the Google GenAI client with the mandatory named parameter for the API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Fix: Generate a summary string from estimatedItems to replace non-existent cost properties.
  const estimatedItemsSummary = inputs.estimatedItems.length > 0
    ? inputs.estimatedItems.map(item => `- ${item.name}: $${item.amount.toLocaleString()} ${item.remark ? `(${item.remark})` : ''}`).join('\n')
    : "無預估支出項目";

  const prompt = `
    As a senior financial auditor, analyze the following budget data for a professional accounting system:
    
    Income: $${inputs.totalIncome.toLocaleString()}
    Already Spent: $${inputs.actualExpenditure.toLocaleString()} (${metrics.currentSpentPercentage.toFixed(2)}%)
    
    Future Estimated Expenditures:
    ${estimatedItemsSummary}
    
    Projected Total Spending: $${metrics.totalProjectedExpenditure.toLocaleString()} (${metrics.projectedTotalPercentage.toFixed(2)}% of income)
    Remaining Balance: $${metrics.remainingBudget.toLocaleString()}
    
    Provide a professional assessment including:
    1. A detailed analysis of the spending patterns.
    2. Specific recommendations to optimize the budget.
    3. A risk status (Healthy, Warning, or Critical).
  `;

  try {
    // Using gemini-3-pro-preview for complex reasoning and professional analysis tasks.
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { 
              type: Type.STRING,
              description: "A professional and detailed analysis of the budget situation."
            },
            recommendations: { 
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Specific, actionable steps to improve financial health."
            },
            status: { 
              type: Type.STRING,
              description: "Overall health status: Healthy, Warning, or Critical."
            }
          },
          required: ["analysis", "recommendations", "status"]
        }
      }
    });

    // Extracting text output directly from the .text property of GenerateContentResponse.
    const jsonStr = response.text?.trim();
    if (!jsonStr) {
      throw new Error("AI returned an empty or invalid response.");
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Insight Error:", error);
    // Robust error handling with a graceful fallback.
    return {
      analysis: "目前系統無法產生即時財務分析。請手動審核您的預算數據，並確保所有支出項均已正確列出。",
      recommendations: [
        "定期檢視各項支出佔比，避免單一項目超出預期。",
        "建議保留至少 10-15% 的應急預備金以應對突發狀況。",
        "審核預估項目的必要性，優先保留核心業務支出。"
      ],
      status: "Warning"
    };
  }
};
