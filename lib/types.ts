// Core banking types following development rules
export interface User {
  id: string;
  email: string;
  role: "admin" | "user";
  kycStatus: "pending" | "verified" | "rejected";
  createdAt: Date;
}

export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  balance: number; // stored in cents/kobo
  currency: string;
  type: "savings" | "current" | "investment";
}

export interface Transaction {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number; // in cents/kobo
  type: "transfer" | "deposit" | "withdrawal";
  status: "pending" | "completed" | "failed";
  createdAt: Date;
}

export interface SavingsPlan {
  id: string;
  userId: string;
  name: string;
  targetAmount: number; // in cents/kobo
  currentAmount: number; // in cents/kobo
  interestRate: number;
  maturityDate: Date;
}

export interface Loan {
  id: string;
  userId: string;
  amount: number; // in cents/kobo
  interestRate: number;
  term: number; // in months
  status: "pending" | "approved" | "rejected" | "active" | "completed";
  monthlyPayment: number; // in cents/kobo
}

// Utility function to format currency
export const formatCurrency = (amount: number, currency = "NGN"): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
  }).format(amount / 100); // Convert from cents/kobo to main unit
};