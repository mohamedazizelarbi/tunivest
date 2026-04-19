// Models - TypeScript types matching the database schema

export type RiskProfile = 'conservative' | 'moderate' | 'aggressive';
export type InvestmentCategory = 'bonds' | 'stocks' | 'funds' | 'real_estate' | 'crypto';
export type TransactionType = 'buy' | 'sell' | 'dividend' | 'withdrawal' | 'deposit';
export type PersonalityType = 'analyst' | 'diplomat' | 'sentinel' | 'explorer';
export type AgeRange = 'under_18' | '18_25' | '26_35' | '36_50' | '50_plus';
export type EmploymentStatus = 'student' | 'employed' | 'self_employed' | 'unemployed';
export type MonthlyIncomeRange = 'lt_1000' | '1000_3000' | 'gt_3000';
export type SavingsRange = 'lt_500' | '500_2000' | '2000_5000' | 'gt_5000';
export type RiskTolerance = 'low' | 'medium' | 'high';
export type InvestmentKnowledge = 'beginner' | 'intermediate' | 'advanced';
export type PrimaryGoal = 'preserve_money' | 'grow_steadily' | 'maximize_profits';
export type InvestmentDuration = 'short' | 'medium' | 'long';
export type InvestmentPreference = 'stocks' | 'crypto' | 'real_estate' | 'forex' | 'business';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  salary: number | null;
  risk_profile: RiskProfile;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: string;
  name: string;
  description: string | null;
  category: InvestmentCategory;
  min_amount: number;
  expected_return: number;
  risk_level: number;
  duration_months: number;
  is_active: boolean;
  created_at: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  investment_id: string;
  amount: number;
  purchase_price: number;
  current_value: number;
  purchased_at: string;
  updated_at: string;
  investment?: Investment;
}

export interface Recommendation {
  id: string;
  user_id: string;
  investment_id: string;
  score: number;
  reason: string | null;
  is_viewed: boolean;
  created_at: string;
  investment?: Investment;
}

export interface Transaction {
  id: string;
  user_id: string;
  investment_id: string;
  type: TransactionType;
  amount: number;
  price_per_unit: number;
  total_value: number;
  created_at: string;
  investment?: Investment;
}

export interface MarketData {
  id: string;
  investment_id: string;
  price: number;
  change_percent: number;
  volume: number;
  recorded_at: string;
  investment?: Investment;
}

export interface Simulation {
  id: string;
  user_id: string;
  investment_id: string;
  initial_amount: number;
  duration_months: number;
  projected_return: number;
  projected_value: number;
  created_at: string;
  investment?: Investment;
}

export interface UserProfile {
  user_id: string;
  personality_type: PersonalityType;
  age_range: AgeRange;
  employment_status: EmploymentStatus;
  monthly_income_range: MonthlyIncomeRange;
  savings_range: SavingsRange;
  risk_tolerance: RiskTolerance;
  investment_knowledge: InvestmentKnowledge;
  primary_goal: PrimaryGoal;
  investment_duration: InvestmentDuration;
  preferences: InvestmentPreference[];
  budget_min_tnd: number;
  budget_max_tnd: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Dashboard statistics
export interface DashboardStats {
  totalInvested: number;
  totalValue: number;
  totalReturn: number;
  returnPercentage: number;
  portfolioCount: number;
}

// Admin statistics
export interface AdminStats {
  totalUsers: number;
  totalInvestments: number;
  totalTransactions: number;
  totalVolume: number;
}
