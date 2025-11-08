# Vendor Sales Integration - Deployment Checklist

## 🚀 Pre-Deployment Checklist

### 1. Code Review
- [ ] Review all changes in `src/lib/firebase-vendor-wallet.ts`
- [ ] Review changes in `src/lib/firebase-orders.ts`
- [ ] Review changes in `src/types/index.ts`
- [ ] Review changes in `src/components/cart-provider.tsx`
- [ ] Review changes in `src/pages/Checkout.tsx`
- [ ] Verify all imports are correct
- [ ] Check for TypeScript errors: `npm run lint`
- [ ] Build project successfully: `npm run build`

### 2. Environment Variables
- [ ] Ensure Firebase config is set up
- [ ] Verify Paystack keys are configured
- [ ] Check all API keys are in place
- [ ] Set `VITE_PAYSTACK_PUBLIC_KEY` in `.env`

### 3. Firebase Configuration

#### Firestore Indexes (CRITICAL)
Create these composite indexes in Firebase Console:

**Collection: `vendorTransactions`**
```
vendorId (Ascending) → createdAt (Descending)
```

**Collection: `vendorPayouts`**
```
vendorId (Ascending) → requestedAt (Descending)
status (Ascending) → requestedAt (Ascending)
```

**Steps to create:**
1. Go to Firebase Console → Firestore Database → Indexes
2. Click "Create Index"
3. Add the fields and directions as specified above
4. Wait for indexes to build (can take several minutes)

#### Firestore Security Rules
- [ ] Update security rules for `vendorWallets` collection
- [ ] Update security rules for `vendorTransactions` collection
- [ ] Update security rules for `vendorPayouts` collection

**Add these rules to `firestore.rules`:**

```javascript
// Vendor Wallets - Read only by owner, write only server-side
match /vendorWallets/{walletId} {
  allow read: if request.auth != null && 
              (request.auth.uid == resource.data.vendorId || 
               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
  allow write: if false; // Only server-side functions can write
}

// Vendor Transactions - Read only by owner or admin
match /vendorTransactions/{txnId} {
  allow read: if request.auth != null && 
              (request.auth.uid == resource.data.vendorId || 
               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
  allow write: if false; // Only server-side functions can write
}

// Vendor Payouts - Create by vendor, update by admin
match /vendorPayouts/{payoutId} {
  allow read: if request.auth != null && 
              (request.auth.uid == resource.data.vendorId || 
               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
  allow create: if request.auth != null && 
                request.auth.uid == request.resource.data.vendorId;
  allow update: if request.auth != null && 
                get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
  allow delete: if false;
}
```

- [ ] Deploy security rules: `firebase deploy --only firestore:rules`

### 4. Data Migration

#### Initialize Wallets for Existing Vendors
- [ ] Create migration script
- [ ] Test migration on staging database
- [ ] Run migration on production database

**Migration Script:**
```typescript
// Create file: scripts/migrate-vendor-wallets.ts
import { initializeVendorWallet } from '../src/lib/firebase-vendor-wallet';
import { getAllVendors } from '../src/lib/firebase-vendors';

async function migrateVendorWallets() {
  console.log('Starting wallet migration...');
  
  try {
    const vendors = await getAllVendors();
    console.log(`Found ${vendors.length} vendors`);
    
    for (const vendor of vendors) {
      try {
        await initializeVendorWallet(vendor.id);
        console.log(`✅ Initialized wallet for vendor: ${vendor.id}`);
      } catch (error) {
        console.error(`❌ Failed for vendor ${vendor.id}:`, error);
      }
    }
    
    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateVendorWallets();
```

- [ ] Run migration: `node scripts/migrate-vendor-wallets.ts`

### 5. Testing

#### Unit Tests
- [ ] Test wallet initialization
- [ ] Test commission calculation (10% = correct)
- [ ] Test credit vendor wallet function
- [ ] Test confirm earnings function
- [ ] Test payout request validation
- [ ] Test payout processing

#### Integration Tests
- [ ] Create test order with vendorId
- [ ] Verify payment adds to pending balance
- [ ] Verify delivery moves to available balance
- [ ] Request test payout
- [ ] Process test payout as admin
- [ ] Verify transaction history

#### End-to-End Test
- [ ] Complete order flow from cart to delivery
- [ ] Verify wallet updates at each stage
- [ ] Check transaction records are created
- [ ] Test payout request and approval
- [ ] Verify final balances are correct

### 6. Monitoring Setup
- [ ] Set up Firebase Performance Monitoring
- [ ] Enable Firebase Crashlytics
- [ ] Set up alerts for failed transactions
- [ ] Set up alerts for failed payouts
- [ ] Configure logging for wallet operations

---

## 🎯 Deployment Steps

### Step 1: Backup Current Database
```bash
# Export current Firestore data
firebase firestore:export gs://YOUR_BUCKET/backup-$(date +%Y%m%d)
```
- [ ] Backup completed successfully
- [ ] Verify backup can be restored

### Step 2: Deploy Code Changes
```bash
# Install dependencies
npm install

# Run tests
npm run test

# Build for production
npm run build

# Deploy to hosting
firebase deploy --only hosting
```
- [ ] Dependencies installed
- [ ] Tests passed
- [ ] Build successful
- [ ] Deployed to hosting

### Step 3: Deploy Firestore Rules & Indexes
```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Note: Indexes must be created manually in Firebase Console
```
- [ ] Security rules deployed
- [ ] Firestore indexes created and built

### Step 4: Run Data Migration
```bash
# Initialize wallets for existing vendors
npm run migrate:wallets
```
- [ ] Migration script executed
- [ ] All vendor wallets initialized
- [ ] No errors in migration logs

### Step 5: Verify Deployment
- [ ] Visit production site
- [ ] Test order creation
- [ ] Verify vendorId in order items
- [ ] Check vendor dashboard shows wallet balance
- [ ] Test transaction history display

---

## 🧪 Post-Deployment Testing

### Critical Path Tests

#### Test 1: New Order with Payment
1. [ ] Add product to cart (verify vendorId stored)
2. [ ] Complete checkout with payment
3. [ ] Verify order created with vendorId in items
4. [ ] Check vendor wallet pending balance increased
5. [ ] Verify commission deducted (10%)
6. [ ] Confirm two transactions created (credit + commission)

#### Test 2: Order Delivery
1. [ ] Mark order as "delivered"
2. [ ] Verify funds moved from pending to available
3. [ ] Check confirmation transaction created
4. [ ] Verify vendor can see available balance

#### Test 3: Payout Request
1. [ ] Request payout as vendor
2. [ ] Verify minimum amount validation (₦5,000)
3. [ ] Confirm payout request appears in admin panel
4. [ ] Approve payout as admin
5. [ ] Verify balance deducted from vendor wallet
6. [ ] Confirm payout transaction created

#### Test 4: Multi-Vendor Order
1. [ ] Add products from different vendors to cart
2. [ ] Complete order
3. [ ] Verify each vendor's wallet credited correctly
4. [ ] Check commission calculated for each vendor
5. [ ] Confirm transactions created for all vendors

### Edge Cases to Test
- [ ] Order with ₦0 commission (test calculation)
- [ ] Payout request exceeding balance (should fail)
- [ ] Payout request below minimum (should fail)
- [ ] Order cancellation (refund scenario)
- [ ] Concurrent payout requests
- [ ] Very large order amounts

---

## 📊 Monitoring & Validation

### First 24 Hours
- [ ] Monitor Firebase console for errors
- [ ] Check wallet balance updates are working
- [ ] Verify commission calculations are correct
- [ ] Monitor payout requests
- [ ] Track transaction record creation
- [ ] Review any error logs

### First Week
- [ ] Audit 10 random orders for correct wallet credits
- [ ] Verify total commission earned matches expectations
- [ ] Check vendor payout success rate
- [ ] Review vendor feedback on wallet system
- [ ] Monitor performance metrics

### Metrics to Track
- [ ] Total orders with vendorId
- [ ] Total commission earned
- [ ] Average payout processing time
- [ ] Failed payout rate
- [ ] Wallet balance accuracy
- [ ] Transaction record completeness

---

## 🐛 Rollback Plan

### If Critical Issues Found

#### Quick Rollback
```bash
# Revert to previous deployment
firebase hosting:rollback

# Restore database from backup if needed
firebase firestore:import gs://YOUR_BUCKET/backup-YYYYMMDD
```

#### Disable Wallet System Temporarily
```typescript
// In firebase-orders.ts, comment out wallet crediting:
// await creditVendorsForOrder(order, true);
```

#### Issues That Require Rollback
- [ ] Negative balances appearing
- [ ] Commission not calculating correctly
- [ ] Wallets not updating
- [ ] Data corruption
- [ ] Severe performance degradation

---

## 📞 Support Preparation

### Documentation
- [ ] Share `VENDOR_SALES_INTEGRATION_FIXES.md` with team
- [ ] Share `VENDOR_WALLET_QUICK_REFERENCE.md` with developers
- [ ] Create internal wiki page for wallet system

### Team Training
- [ ] Train admin team on payout processing
- [ ] Train support team on wallet inquiries
- [ ] Train developers on wallet functions
- [ ] Create troubleshooting guide

### Support Scripts
- [ ] Script to check vendor wallet balance
- [ ] Script to verify transaction history
- [ ] Script to manually credit vendor (emergency)
- [ ] Script to cancel payout request

---

## ✅ Go-Live Checklist

### Pre-Launch (1 hour before)
- [ ] All indexes built and active
- [ ] Security rules deployed
- [ ] Database backup completed
- [ ] Team on standby
- [ ] Monitoring dashboards open

### Launch
- [ ] Deploy code to production
- [ ] Run migration script
- [ ] Verify first test order works
- [ ] Monitor for 30 minutes
- [ ] Announce to vendors

### Post-Launch (First Hour)
- [ ] Monitor error rates
- [ ] Check wallet updates are working
- [ ] Verify commission calculations
- [ ] Review first transactions
- [ ] Check vendor dashboard access

### Post-Launch (First Day)
- [ ] Review all orders from day
- [ ] Audit wallet balances
- [ ] Check commission totals
- [ ] Process any payout requests
- [ ] Gather vendor feedback

---

## 📋 Success Criteria

The deployment is considered successful when:
- ✅ All orders include vendorId in items
- ✅ Vendor wallets update automatically on payment
- ✅ 10% commission calculated correctly
- ✅ Funds move to available balance on delivery
- ✅ Vendors can request payouts
- ✅ Admins can process payouts
- ✅ Transaction history is complete
- ✅ No negative balances
- ✅ No failed wallet operations
- ✅ Zero data corruption

---

## 🎉 Launch Announcement

### Email to Vendors
```
Subject: New Wallet System - Track Your Earnings in Real-Time!

Dear Vendor,

We're excited to announce our new Wallet System is now live!

What's New:
✅ Real-time earnings tracking
✅ Transparent commission structure (10%)
✅ Easy payout requests (minimum ₦5,000)
✅ Complete transaction history
✅ Pending vs. available balance tracking

How It Works:
1. When customers pay for orders → Earnings go to "Pending Balance"
2. When orders are delivered → Funds move to "Available Balance"
3. Request payout → Admin approves → Money sent to your bank

Visit your dashboard to see your wallet balance!

Questions? Contact support@ruachestore.com

Best regards,
RUACH E-Store Team
```

---

## 📝 Deployment Sign-Off

### Approvals Required
- [ ] Tech Lead approval
- [ ] Product Manager approval
- [ ] Finance Team approval (commission rates)
- [ ] Legal Team approval (payout terms)

### Deployment Date & Time
- **Planned:** ________________
- **Actual:** ________________
- **Deployed By:** ________________

### Post-Deployment Confirmation
- [ ] All tests passed
- [ ] No critical errors in first hour
- [ ] Vendor wallets updating correctly
- [ ] Admin can process payouts
- [ ] Documentation shared with team

---

**Status:** ⏳ Ready for Deployment

**Last Updated:** 2024-01-15
**Version:** 1.0.0
**Team:** RUACH E-Store Development Team