export type UserRole = "consumer" | "merchant" | "agent";

export type UserProfile = {
  id: string;
  phone_number: string;
  full_name: string | null;
  role: UserRole;
  wallet_balance: number;
  pin_hash: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type TransactionType =
  | "send"
  | "receive"
  | "withdraw"
  | "borrow"
  | "repay"
  | "deposit";

export type TransactionStatus = "pending" | "completed" | "failed";

export type Transaction = {
  id: string;
  sender_id: string | null;
  receiver_id: string | null;
  amount: number;
  fee: number;
  type: TransactionType;
  status: TransactionStatus;
  reference: string | null;
  description: string | null;
  created_at: string;
};

export type MerchantCategory =
  | "spaza"
  | "kota"
  | "street_vendor"
  | "taxi"
  | "agent";

export type Merchant = {
  id: string;
  user_id: string | null;
  name: string;
  category: MerchantCategory;
  address: string | null;
  distance: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: string;
};

export type BorrowStatus = "active" | "repaid" | "overdue";

export type Borrow = {
  id: string;
  user_id: string;
  amount: number;
  fee: number;
  purpose: "food" | "airtime" | "transport" | "other" | null;
  status: BorrowStatus;
  due_date: string | null;
  created_at: string;
  repaid_at: string | null;
};
