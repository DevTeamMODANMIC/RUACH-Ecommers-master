# KYC Integration Guide

This document explains how to implement and use the KYC (Know Your Customer) functionality in the RUACH E-commerce platform.

## Overview

The KYC functionality consists of two main steps:
1. Create customer → get CUS_xxx
2. Resolve bank account /bank/resolve → confirm account name matches

## Implementation Files

- `src/lib/paystack-kyc.ts` - Core KYC functionality
- `src/pages/KycTest.tsx` - Test page for KYC functionality
- `src/pages/admin/AdminKyc.tsx` - Admin management page for KYC records

## API Functions

### 1. Create Customer

```typescript
import { createCustomer, CustomerData } from '@/lib/paystack-kyc';

const customerData: CustomerData = {
  email: "anna@example.com",
  first_name: "Anna",
  last_name: "Bron",
  phone: "08012345678"
};

const customer = await createCustomer(customerData);
console.log(customer.id); // CUS_xxx format
```

### 2. Resolve Bank Account

```typescript
import { resolveBankAccount, BankAccountData } from '@/lib/paystack-kyc';

const bankData: BankAccountData = {
  bank_code: "632005",
  country_code: "ZA",
  account_number: "012456789",
  account_name: "Ann Bron",
  account_type: "personal",
  document_type: "identityNumber",
  document_number: "1234567890123"
};

const fullName = "Anna Bron";
const verification = await resolveBankAccount(bankData, fullName);
console.log(verification.verified); // true or false
```

## Testing

1. Navigate to `/kyc-test` to test the customer creation and bank verification functionality
2. Use the form to create a customer and verify a bank account

## Admin Management

Admins can view and manage KYC records at `/admin/kyc`

## Integration with Paystack

To integrate with the actual Paystack API:

1. Add your Paystack secret key to your environment variables:
   ```
   VITE_PAYSTACK_SECRET_KEY=your_secret_key_here
   ```

2. Uncomment the API call sections in `src/lib/paystack-kyc.ts`:
   ```typescript
   // In createCustomer function:
   const response = await fetch('https://api.paystack.co/customer', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${import.meta.env.VITE_PAYSTACK_SECRET_KEY}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       email: customerData.email,
       first_name: customerData.first_name,
       last_name: customerData.last_name,
       phone: customerData.phone
     })
   });
   
   // In resolveBankAccount function:
   const response = await fetch(`https://api.paystack.co/bank/resolve?account_number=${bankAccountData.account_number}&bank_code=${bankAccountData.bank_code}`, {
     method: 'GET',
     headers: {
       'Authorization': `Bearer ${import.meta.env.VITE_PAYSTACK_SECRET_KEY}`,
       'Content-Type': 'application/json'
     }
   });
   ```

## Validation Functions

The library includes validation functions for both customer and bank account data:

```typescript
import { validateCustomerData, validateBankAccountData } from '@/lib/paystack-kyc';

const isCustomerValid = validateCustomerData(customerData);
const isBankValid = validateBankAccountData(bankData);
```

## Name Matching

The system includes intelligent name matching to handle variations like "Ann" vs "Anna":

```typescript
// Matches:
// "Ann Bron" vs "Anna Bron"
// "John Smith" vs "John A. Smith"
// "Mary Johnson" vs "Johnson, Mary"
```

## Error Handling

All functions throw descriptive errors that should be handled appropriately:

```typescript
try {
  const customer = await createCustomer(customerData);
} catch (error) {
  console.error("Failed to create customer:", error.message);
}
```