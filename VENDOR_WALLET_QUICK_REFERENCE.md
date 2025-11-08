# Vendor Wallet System - Quick Reference Guide

## 🚀 Quick Start

### Initialize a Vendor Wallet
```typescript
import { initializeVendorWallet } from "@/lib/firebase-vendor-wallet";

// For a single-store vendor
await initializeVendorWallet(vendorId);

// For a multi-store vendor
await initializeVendorWallet(vendorId, storeId);
```

### Get Wallet Balance
```typescript
import { getVendorWallet } from "@/lib/firebase-vendor-wallet";

const wallet = await getVendorWallet(vendorId);
console.log(`Available: ₦${wallet.balance}`);
console.log(`Pending: ₦${wallet.pendingBalance}`);
console.log(`Total Earned: ₦${wallet.totalEarnings}`);
```

---

## 💰 Common Operations

### 1. Credit Vendor When Order is Paid
```typescript
import { creditVendorWallet } from "@/lib/firebase-vendor-wallet";

// Add to PENDING balance (order not yet delivered)
await creditVendorWallet(
  vendorId,
  10000,  // Gross amount: ₦10,000
  "Order #12345 payment confirmed",
  "order_12345",
  storeId,
  true    // isPending = true
);

// Result:
// - Commission (10%): ₦1,000 deducted
// - Pending Balance: +₦9,000
// - Two transactions created (credit + commission)
```

### 2. Confirm Earnings When Order Delivered
```typescript
import { confirmVendorEarnings } from "@/lib/firebase-vendor-wallet";

// Move from PENDING to AVAILABLE balance
await confirmVendorEarnings(
  vendorId,
  9000,  // Net amount (after commission)
  "Order #12345 delivered",
  "order_12345",
  storeId
);

// Result:
// - Pending Balance: -₦9,000
// - Available Balance: +₦9,000
// - Vendor can now withdraw
```

### 3. Request Payout
```typescript
import { requestVendorPayout } from "@/lib/firebase-vendor-wallet";

const payout = await requestVendorPayout(
  vendorId,
  20000,  // ₦20,000
  "bank_transfer",
  {
    bankName: "GTBank",
    accountNumber: "0123456789",
    accountName: "John Doe"
  },
  storeId
);

console.log(`Payout ID: ${payout.id}`);
console.log(`Status: ${payout.status}`); // "pending"
```

### 4. Process Payout (Admin Only)
```typescript
import { processVendorPayout } from "@/lib/firebase-vendor-wallet";

// Approve payout
await processVendorPayout(
  payoutId,
  "completed",
  "Processed via bank transfer"
);

// Reject payout
await processVendorPayout(
  payoutId,
  "failed",
  "Admin notes",
  "Invalid bank details"
);
```

### 5. Get Transaction History
```typescript
import { getVendorTransactions } from "@/lib/firebase-vendor-wallet";

const transactions = await getVendorTransactions(vendorId, storeId, 50);

transactions.forEach(txn => {
  console.log(`${txn.type}: ₦${txn.amount} - ${txn.description}`);
});
```

### 6. Refund/Debit Vendor
```typescript
import { debitVendorWallet } from "@/lib/firebase-vendor-wallet";

await debitVendorWallet(
  vendorId,
  5000,  // ₦5,000
  "Refund for Order #12345",
  "order_12345",
  storeId
);

// Result:
// - Available Balance: -₦5,000
// - Transaction created with type "debit"
```

---

## 📊 Display Wallet Info in UI

### Dashboard Widget
```typescript
import { useEffect, useState } from "react";
import { getVendorWallet } from "@/lib/firebase-vendor-wallet";

function WalletCard({ vendorId }) {
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    const loadWallet = async () => {
      const data = await getVendorWallet(vendorId);
      setWallet(data);
    };
    loadWallet();
  }, [vendorId]);

  if (!wallet) return <div>Loading...</div>;

  return (
    <div className="wallet-card">
      <h3>Wallet Balance</h3>
      <div className="balance">₦{wallet.balance.toFixed(2)}</div>
      <div className="pending">Pending: ₦{wallet.pendingBalance.toFixed(2)}</div>
      <div className="total">Total Earned: ₦{wallet.totalEarnings.toFixed(2)}</div>
      <button>Withdraw Funds</button>
    </div>
  );
}
```

### Transaction History
```typescript
import { getVendorTransactions } from "@/lib/firebase-vendor-wallet";

function TransactionHistory({ vendorId }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const loadTransactions = async () => {
      const txns = await getVendorTransactions(vendorId);
      setTransactions(txns);
    };
    loadTransactions();
  }, [vendorId]);

  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Description</th>
          <th>Amount</th>
          <th>Balance After</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map(txn => (
          <tr key={txn.id}>
            <td>{new Date(txn.createdAt).toLocaleDateString()}</td>
            <td><span className={`badge ${txn.type}`}>{txn.type}</span></td>
            <td>{txn.description}</td>
            <td className={txn.type === 'debit' ? 'negative' : 'positive'}>
              {txn.type === 'debit' ? '-' : '+'}₦{txn.amount}
            </td>
            <td>₦{txn.balanceAfter}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 🔧 Integration with Order System

### Automatic Wallet Updates
The system automatically credits vendors when:

**1. Order Status Changes to "processing"** (payment confirmed)
```typescript
// In firebase-orders.ts
if (status === "processing" && order.paymentStatus === "paid") {
  // Automatically adds to pending balance
  await creditVendorsForOrder(order, false);
}
```

**2. Order Status Changes to "delivered"**
```typescript
// In firebase-orders.ts
if (status === "delivered") {
  // Automatically moves to available balance
  await creditVendorsForOrder(order, true);
}
```

### Manual Credit (if needed)
```typescript
// For orders with multiple vendors
const order = await getOrder(orderId);

// Group items by vendor
const vendorTotals = new Map();
order.items.forEach(item => {
  if (item.vendorId) {
    const current = vendorTotals.get(item.vendorId) || 0;
    vendorTotals.set(item.vendorId, current + (item.price * item.quantity));
  }
});

// Credit each vendor
for (const [vendorId, total] of vendorTotals) {
  await creditVendorWallet(
    vendorId,
    total,
    `Order #${orderId}`,
    orderId,
    undefined,
    false  // Add to available balance immediately
  );
}
```

---

## 💡 Commission Calculation

### Default Rate
```typescript
import { PLATFORM_COMMISSION_RATE, calculateCommission } from "@/lib/firebase-vendor-wallet";

console.log(PLATFORM_COMMISSION_RATE); // 10

const orderTotal = 50000;  // ₦50,000
const commission = calculateCommission(orderTotal);
console.log(commission); // ₦5,000

const vendorGets = orderTotal - commission;
console.log(vendorGets); // ₦45,000
```

### Custom Commission Rate (Future)
```typescript
// To implement tiered rates later
const commission = calculateCommission(amount, 5); // 5% for premium vendors
```

---

## 🛡️ Error Handling

### Check Balance Before Operations
```typescript
const wallet = await getVendorWallet(vendorId);

if (wallet.balance < requestedAmount) {
  throw new Error("Insufficient balance");
}

if (requestedAmount < 5000) {
  throw new Error("Minimum payout is ₦5,000");
}
```

### Try-Catch Blocks
```typescript
try {
  await creditVendorWallet(vendorId, amount, description);
  console.log("✅ Wallet credited successfully");
} catch (error) {
  console.error("❌ Failed to credit wallet:", error.message);
  // Handle error (notify admin, retry, etc.)
}
```

---

## 📋 Validation Rules

### Payout Requests
- ✅ Minimum amount: ₦5,000
- ✅ Maximum: Current available balance
- ✅ Bank details required
- ✅ Valid vendor account

### Wallet Operations
- ✅ Cannot go negative
- ✅ Commission automatically deducted
- ✅ All operations create transaction records
- ✅ Pending and available balances tracked separately

---

## 🔍 Debugging

### Check Wallet State
```typescript
const wallet = await getVendorWallet(vendorId);
console.log("Wallet Debug Info:", {
  available: wallet.balance,
  pending: wallet.pendingBalance,
  totalEarned: wallet.totalEarnings,
  totalWithdrawn: wallet.totalWithdrawn,
  lastUpdated: wallet.updatedAt
});
```

### Check Recent Transactions
```typescript
const transactions = await getVendorTransactions(vendorId, undefined, 10);
console.log("Last 10 Transactions:");
transactions.forEach(txn => {
  console.log(`[${txn.type}] ₦${txn.amount} - ${txn.description}`);
});
```

### Check Pending Payouts
```typescript
import { getVendorPayouts } from "@/lib/firebase-vendor-wallet";

const payouts = await getVendorPayouts(vendorId);
const pending = payouts.filter(p => p.status === "pending");
console.log(`${pending.length} pending payouts`);
```

---

## 📱 Mobile/React Components

### Wallet Balance Component
```typescript
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export function WalletBalance({ wallet }) {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <Wallet className="h-5 w-5" />
        <span>Available Balance</span>
      </div>
      <div className="text-3xl font-bold">
        ₦{wallet.balance.toLocaleString()}
      </div>
      <div className="text-sm text-muted-foreground">
        Pending: ₦{wallet.pendingBalance.toLocaleString()}
      </div>
      <Button className="w-full mt-4">
        Request Payout
      </Button>
    </Card>
  );
}
```

---

## 🎯 Testing

### Test Wallet Creation
```typescript
const wallet = await initializeVendorWallet("test_vendor_123");
expect(wallet.balance).toBe(0);
expect(wallet.pendingBalance).toBe(0);
expect(wallet.totalEarnings).toBe(0);
```

### Test Commission Calculation
```typescript
const commission = calculateCommission(10000);
expect(commission).toBe(1000); // 10%
```

### Test Credit Operation
```typescript
await creditVendorWallet("vendor123", 10000, "Test order", "order123", undefined, false);
const wallet = await getVendorWallet("vendor123");
expect(wallet.balance).toBe(9000); // 10,000 - 10% commission
```

---

## 📞 Common Issues & Solutions

### Issue: Wallet not found
**Solution:** Initialize the wallet first
```typescript
await initializeVendorWallet(vendorId);
```

### Issue: Balance not updating
**Solution:** Check if order has vendorId in items
```typescript
// In checkout, ensure vendorId is included
items: items.map(item => ({
  ...item,
  vendorId: item.vendorId  // Must be present!
}))
```

### Issue: Commission not deducted
**Solution:** Use `creditVendorWallet()` not direct balance update
```typescript
// ❌ Don't do this
await updateDoc(walletRef, { balance: newBalance });

// ✅ Do this instead
await creditVendorWallet(vendorId, amount, description);
```

---

## 🔗 Related Functions

### Core Functions
- `initializeVendorWallet()` - Create new wallet
- `getVendorWallet()` - Fetch wallet data
- `creditVendorWallet()` - Add funds with commission
- `confirmVendorEarnings()` - Move pending to available
- `debitVendorWallet()` - Remove funds (refunds)
- `requestVendorPayout()` - Request withdrawal
- `processVendorPayout()` - Approve/reject payout
- `getVendorTransactions()` - Get transaction history
- `getVendorPayouts()` - Get payout history
- `calculateCommission()` - Calculate platform fee

### Helper Functions
- `getPendingPayouts()` - Get all pending payouts (admin)

---

## 📚 Full Example: Complete Order Flow

```typescript
// 1. Customer places order
const order = await createOrder({
  items: [
    { productId: "prod1", vendorId: "vendor123", price: 5000, quantity: 2 }
  ]
  // ... other order data
});

// 2. Payment confirmed - Order status → "processing"
await updateOrderStatus(order.id, "processing");
// ✅ Automatically adds ₦9,000 to pending balance (₦10,000 - 10% commission)

// 3. Vendor ships order
await updateOrderStatus(order.id, "shipped");
// No wallet change

// 4. Order delivered
await updateOrderStatus(order.id, "delivered");
// ✅ Automatically moves ₦9,000 from pending to available

// 5. Vendor requests payout
const payout = await requestVendorPayout(
  "vendor123",
  9000,
  "bank_transfer",
  { bankName: "GTBank", accountNumber: "0123456789", accountName: "Vendor Name" }
);

// 6. Admin approves
await processVendorPayout(payout.id, "completed", "Paid via bank transfer");
// ✅ Balance deducted, totalWithdrawn updated

// 7. Check final state
const wallet = await getVendorWallet("vendor123");
console.log({
  balance: wallet.balance,          // ₦0
  pending: wallet.pendingBalance,   // ₦0
  earned: wallet.totalEarnings,     // ₦9,000
  withdrawn: wallet.totalWithdrawn  // ₦9,000
});
```

---

**Need Help?** 
- Check `VENDOR_SALES_INTEGRATION_FIXES.md` for full documentation
- Review `src/lib/firebase-vendor-wallet.ts` for implementation details
- Test in development environment before production use

**Version:** 1.0.0  
**Last Updated:** 2024-01-15