export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  balance: number; // stored in cents/kobo
  currency: string;
  type: "savings" | "current" | "investment";
  status: "active" | "suspended" | "closed";
  createdAt: Date;
  updatedAt?: Date;
}

export interface Transaction {
  id: string;
  fromAccount?: string;
  toAccount?: string;
  amount: number; // stored in cents/kobo
  currency: string;
  type: "transfer" | "deposit" | "withdrawal" | "payment";
  description: string;
  reference: string;
  status: "pending" | "completed" | "failed";
  timestamp: Date;
  userId: string;
}

export interface CreateAccountRequest {
  type: "savings" | "current" | "investment";
  currency?: string;
}

export interface TransferRequest {
  fromAccount: string;
  toAccount: string;
  amount: number;
  description?: string;
}