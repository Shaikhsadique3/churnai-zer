import { supabase } from "@/integrations/supabase/client";

export interface CustomerData {
  customer_name: string;
  customer_email: string;
  signup_date: string;
  last_active_date: string;
  plan: string;
  billing_status: string;
  monthly_revenue: number;
  active_features_used: number;
  support_tickets_opened: number;
  email_opens_last30days: number;
  number_of_logins_last30days: number;
}

export interface ChurnPredictionResult {
  churn_score: number;
  churn_reason: string;
  risk_level: 'high' | 'medium' | 'low';
  insight: string;
  understanding_score?: number;
}

export interface ChurnApiResponse {
  success: boolean;
  batch: boolean;
  result?: ChurnPredictionResult;
  results?: ChurnPredictionResult[];
  errors?: Array<{
    customer: string;
    error: string;
    index: number;
  }>;
  total?: number;
  successful?: number;
  failed?: number;
}

/**
 * Make a secure churn prediction using the Supabase edge function
 * @param customerData - Single customer data object
 * @returns Promise<ChurnApiResponse>
 */
export async function predictChurn(customerData: CustomerData): Promise<ChurnApiResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('churn-prediction', {
      body: {
        customerData,
        isBatch: false
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Churn prediction error:', error);
    throw error;
  }
}

/**
 * Make batch churn predictions using the Supabase edge function
 * @param customersData - Array of customer data objects
 * @returns Promise<ChurnApiResponse>
 */
export async function predictChurnBatch(customersData: CustomerData[]): Promise<ChurnApiResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('churn-prediction', {
      body: {
        customerData: customersData,
        isBatch: true
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Batch churn prediction error:', error);
    throw error;
  }
}

/**
 * Test the churn prediction API connection
 * @returns Promise<{ connected: boolean; message: string }>
 */
export async function testChurnApiConnection(): Promise<{ connected: boolean; message: string }> {
  const testData: CustomerData = {
    customer_name: "Test Customer",
    customer_email: "test@example.com",
    signup_date: "2023-01-01",
    last_active_date: "2024-01-01",
    plan: "Pro",
    billing_status: "Active",
    monthly_revenue: 50,
    active_features_used: 5,
    support_tickets_opened: 0,
    email_opens_last30days: 10,
    number_of_logins_last30days: 20
  };

  try {
    const result = await predictChurn(testData);
    
    if (result.success && result.result) {
      return {
        connected: true,
        message: 'API connection successful'
      };
    } else {
      return {
        connected: false,
        message: 'API test failed'
      };
    }
  } catch (error) {
    return {
      connected: false,
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}