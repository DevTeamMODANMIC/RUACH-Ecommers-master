/**
 * Paystack KYC Integration for Customer Creation and Bank Account Verification
 * This module handles the first two steps of the KYC process:
 * 1. Create customer → get CUS_xxx
 * 2. Resolve bank account /bank/resolve → confirm account name matches
 */

import { NIGERIAN_BANKS } from "@/lib/nigerian-banks";

// Define the customer data structure
export interface CustomerData {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}

// Define the bank account data structure
export interface BankAccountData {
  bank_code: string;
  country_code: string;
  account_number: string;
  account_name?: string;
  account_type?: string;
  document_type?: string;
  document_number?: string;
}

// Define the response structure for customer creation
export interface CustomerResponse {
  id: string; // CUS_xxx format
  customer_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  metadata: any;
  domain: string;
  createdAt: string;
  updatedAt: string;
}

// Define the response structure for bank resolution
export interface BankResolutionResponse {
  account_number: string;
  account_name: string;
  bank_code: string;
  bank_name: string;
  verified: boolean;
  match_status: 'match' | 'no_match' | 'partial_match';
}

// Define the bank resolution result structure
export interface BankResolutionResult {
  bank_code: string;
  bank_name: string;
}

/**
 * Create a customer in Paystack
 * @param customerData - Customer information
 * @returns Promise<CustomerResponse> - Customer details with CUS_xxx identifier
 */
export const createCustomer = async (customerData: CustomerData): Promise<CustomerResponse> => {
  try {
    // Validate required fields
    if (!customerData.email || !customerData.first_name || !customerData.last_name || !customerData.phone) {
      throw new Error("Missing required customer fields");
    }
    
    // In a production environment, you would use the actual Paystack API:
    
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
    
    if (!response.ok) {
      throw new Error(`Paystack API error: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log("customerData", customerData, result)
    return result.data;
    
    
    // For demonstration purposes, we'll simulate the response
    // Generate a mock customer ID in CUS_xxx format
    // const customerId = `CUS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate API delay
    // await new Promise(resolve => setTimeout(resolve, 500));
    
    // // Return mock response
    // return {
    //   id: customerId,
    //   customer_code: customerId,
    //   first_name: customerData.first_name,
    //   last_name: customerData.last_name,
    //   email: customerData.email,
    //   phone: customerData.phone,
    //   metadata: {},
    //   domain: "test",
    //   createdAt: new Date().toISOString(),
    //   updatedAt: new Date().toISOString()
    // };
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
};

/**
 * Resolve a bank from an account number using Paystack's name enquiry API
 * This function attempts to resolve both bank code and account name from account number alone
 * @param accountNumber - The account number to resolve
 * @returns Promise<BankResolutionResult> - The resolved bank information
 */
export const resolveBankFromAccountNumber = async (
  accountNumber: string,
  bankCode: string
): Promise<BankResolutionResult> => {
  try {
    // Validate account number
    if (!accountNumber || accountNumber.length < 10 || accountNumber.length > 12 || !/^\d+$/.test(accountNumber)) {
      throw new Error("Invalid account number. Must be 10-12 digits.");
    }
    
    // In a production environment, you would use the actual Paystack API:
    
    const response = await fetch(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Paystack API error: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log("result", result)
    return {
      bank_code: bankCode,
      bank_name: undefined,
      account_name: result.data.account_name,
      account_number: result.data.account_number
    };
    
    
    // For demonstration purposes, we'll simulate the response
    // Simulate API delay
    // await new Promise(resolve => setTimeout(resolve, 800));
    
    // // Return mock response with a bank based on the account number
    // // In a real implementation, this would come from the Paystack API
    // const bankMapping: Record<string, { bank_code: string; bank_name: string }> = {
    //   "044": { bank_code: "044", bank_name: "Access Bank" },
    //   "011": { bank_code: "011", bank_name: "First Bank of Nigeria" },
    //   "057": { bank_code: "057", bank_name: "Zenith Bank" },
    //   "058": { bank_code: "058", bank_name: "Guaranty Trust Bank" },
    //   "214": { bank_code: "214", bank_name: "First City Monument Bank" },
    //   "033": { bank_code: "033", bank_name: "United Bank for Africa" },
    //   "032": { bank_code: "032", bank_name: "Union Bank of Nigeria" },
    //   "035": { bank_code: "035", bank_name: "Wema Bank" },
    //   "070": { bank_code: "070", bank_name: "Fidelity Bank" },
    //   "215": { bank_code: "215", bank_name: "Unity Bank" },
    //   "063": { bank_code: "063", bank_name: "Access Bank (Diamond)" },
    //   "023": { bank_code: "023", bank_name: "Citibank Nigeria" },
    //   "101": { bank_code: "101", bank_name: "Providus Bank" },
    //   "100": { bank_code: "100", bank_name: "Suntrust Bank" },
    //   "221": { bank_code: "221", bank_name: "Stanbic IBTC Bank" }
    // };
    
    // // Use the first 3 digits of the account number to determine the bank
    // const bankPrefix = accountNumber.substring(0, 3);
    // const bankInfo = bankMapping[bankPrefix] || { bank_code: "000", bank_name: "Unknown Bank" };
    
    // return bankInfo;
  } catch (error) {
    console.error("Error resolving bank from account number:", error);
    throw error;
  }
};

/**
 * Resolve a bank account to verify details
 * @param bankAccountData - Bank account information
 * @param customerName - Customer's full name for comparison
 * @returns Promise<BankResolutionResponse> - Bank account verification details
 */
export const resolveBankAccount = async (
  bankAccountData: BankAccountData,
  customerName: string
): Promise<BankResolutionResponse> => {
  try {
    // Validate required fields
    if (!bankAccountData.bank_code || !bankAccountData.account_number || !bankAccountData.country_code) {
      throw new Error("Missing required bank account fields");
    }
    
    // Check if we're in test mode by looking at the secret key
    const secretKey = import.meta.env.VITE_PAYSTACK_SECRET_KEY;
    const isTestMode = secretKey && (secretKey.startsWith('sk_test_') || !secretKey.startsWith('sk_live_'));
    
    // If in test mode, return mock data to avoid hitting limits
    if (isTestMode) {
      return {
        account_number: bankAccountData.account_number,
        account_name: `${customerName || "Test User"}`,
        bank_code: bankAccountData.bank_code,
        bank_name: "Test Bank",
        verified: true,
        match_status: "match"
      };
    }
    
    // Use the actual Paystack API for bank account resolution:
    const response = await fetch(`https://api.paystack.co/bank/resolve?account_number=${bankAccountData.account_number}&bank_code=${bankAccountData.bank_code}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log("Bank account resolution error:", errorText);
      
      // Check if we're hitting test mode limits
      if (errorText.includes("Test mode daily limit") || errorText.includes("test bank codes")) {
        // In test mode, return mock data for testing purposes
        return {
          account_number: bankAccountData.account_number,
          account_name: `${customerName || "Test User"}`,
          bank_code: bankAccountData.bank_code,
          bank_name: "Test Bank",
          verified: true,
          match_status: "match"
        };
      }
      
      let errorMessage = `Paystack API error: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = `Paystack API error: ${errorData.message || response.statusText}`;
      } catch (parseError) {
        if (errorText) {
          errorMessage = `Paystack API error: ${errorText}`;
        }
      }
      
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log("result", result)
    // Check if the response has the expected structure
    if (!result.status || !result.data) {
      throw new Error("Invalid response from Paystack API");
    }
    
    // For bank account resolution, we might need to handle different response formats
    const accountData = result.data.data || result.data;
    const resolvedAccountName = accountData.account_name;
    
    // Compare account name with customer name
    const matchStatus = compareNames(customerName, resolvedAccountName);
    
    return {
      account_number: bankAccountData.account_number,
      account_name: resolvedAccountName,
      bank_code: bankAccountData.bank_code,
      bank_name: accountData.bank_name,
      verified: result.status === true || result.status === "success",
      match_status: matchStatus
    };
    
  } catch (error: any) {
    console.error("Error resolving bank account:", error);
    throw new Error(error.message || "Failed to verify bank account. Please try again.");
  }
};

/**
 * Resolve a bank from an account number using prefix mapping
 * Fallback method when API fails
 * @param accountNumber - The account number to resolve
 * @returns BankResolutionResult - The resolved bank information
 */
const resolveBankFromPrefix = (accountNumber: string): BankResolutionResult => {
  // Bank code mapping based on account number prefixes
  const bankPrefixMapping: Record<string, { code: string; name: string }> = {
    // First Bank of Nigeria (011) - typically starts with 20 or 30
    "20": { code: "011", name: "First Bank of Nigeria" },
    "30": { code: "011", name: "First Bank of Nigeria" },
    
    // Access Bank (044) - typically starts with 07 or 08
    "07": { code: "044", name: "Access Bank" },
    "08": { code: "044", name: "Access Bank" },
    
    // Zenith Bank (057) - typically starts with 10 or 21
    "10": { code: "057", name: "Zenith Bank" },
    "21": { code: "057", name: "Zenith Bank" },
    
    // Guaranty Trust Bank (058) - typically starts with 01 or 02
    "01": { code: "058", name: "Guaranty Trust Bank" },
    "02": { code: "058", name: "Guaranty Trust Bank" },
    
    // First City Monument Bank (214) - typically starts with 03 or 04
    "03": { code: "214", name: "First City Monument Bank" },
    "04": { code: "214", name: "First City Monument Bank" },
    
    // United Bank for Africa (033) - typically starts with 05 or 06
    "05": { code: "033", name: "United Bank for Africa" },
    "06": { code: "033", name: "United Bank for Africa" },
    
    // Union Bank of Nigeria (032) - typically starts with 09
    "09": { code: "032", name: "Union Bank of Nigeria" },
    
    // Wema Bank (035) - typically starts with 11
    "11": { code: "035", name: "Wema Bank" },
    
    // Fidelity Bank (070) - typically starts with 12
    "12": { code: "070", name: "Fidelity Bank" },
    
    // Polaris Bank (076) - typically starts with 13
    "13": { code: "076", name: "Polaris Bank" },
    
    // Stanbic IBTC Bank (221) - typically starts with 14
    "14": { code: "221", name: "Stanbic IBTC Bank" },
    
    // Sterling Bank (232) - typically starts with 15
    "15": { code: "232", name: "Sterling Bank" },
    
    // Unity Bank (215) - typically starts with 16
    "16": { code: "215", name: "Unity Bank" },
    
    // Providus Bank (101) - typically starts with 17
    "17": { code: "101", name: "Providus Bank" },
    
    // Suntrust Bank (100) - typically starts with 18
    "18": { code: "100", name: "Suntrust Bank" },
    
    // Keystone Bank (082) - typically starts with 19
    "19": { code: "082", name: "Keystone Bank" }
  };
  
  // Try to determine bank from the first 2 digits of the account number
  const prefix = accountNumber.substring(0, 2);
  const bankInfo = bankPrefixMapping[prefix];
  
  if (bankInfo) {
    return {
      bank_code: bankInfo.code,
      bank_name: bankInfo.name
    };
  }
  
  // If we can't determine from prefix, try first digit
  const firstDigit = accountNumber.substring(0, 1);
  const firstDigitMapping: Record<string, { code: string; name: string }> = {
    "0": { code: "011", name: "First Bank of Nigeria" }, // Common default
    "1": { code: "057", name: "Zenith Bank" }, // Common default
    "2": { code: "044", name: "Access Bank" } // Common default
  };
  
  const firstDigitBank = firstDigitMapping[firstDigit];
  if (firstDigitBank) {
    return {
      bank_code: firstDigitBank.code,
      bank_name: firstDigitBank.name
    };
  }
  
  // If all else fails, return a common bank
  return {
    bank_code: "011",
    bank_name: "First Bank of Nigeria"
  };
};

 /*
 * Compare customer name with account name
 * @param customerName - Customer's full name
 * @param accountName - Account holder's name
 * @returns 'match' | 'no_match' | 'partial_match'
 */
const compareNames = (customerName: string, accountName: string): 'match' | 'no_match' | 'partial_match' => {
  // Handle empty or null names
  if (!customerName || !accountName) {
    return 'no_match';
  }
  
  // Normalize names by removing extra spaces and converting to lowercase
  const normalizedCustomerName = customerName.trim().toLowerCase();
  const normalizedAccountName = accountName.trim().toLowerCase();
  
  // Exact match
  if (normalizedCustomerName === normalizedAccountName) {
    return 'match';
  }
  
  // Check if one name is contained in the other
  if (
    normalizedCustomerName.includes(normalizedAccountName) ||
    normalizedAccountName.includes(normalizedCustomerName)
  ) {
    return 'partial_match';
  }
  
  // Split names into parts and check for partial matches
  const customerParts = normalizedCustomerName.split(' ');
  const accountParts = normalizedAccountName.split(' ');
  
  // Check if at least one part matches
  const hasMatchingPart = customerParts.some(part => 
    accountParts.some(accountPart => part === accountPart)
  );
  
  if (hasMatchingPart) {
    return 'partial_match';
  }
  
  return 'no_match';
};

/**
 * Validate bank account details
 * @param bankAccountData - Bank account information
 * @returns boolean - Whether the bank account data is valid
 */
export const validateBankAccountData = (bankAccountData: BankAccountData): boolean => {
  // Check required fields
  if (!bankAccountData.bank_code || !bankAccountData.account_number || !bankAccountData.country_code) {
    return false;
  }
  
  // Validate account number (should be numeric and between 10-12 digits)
  if (!/^\d{10,12}$/.test(bankAccountData.account_number)) {
    return false;
  }
  
  // Validate country code (should be 2 letters)
  if (!/^[A-Z]{2}$/.test(bankAccountData.country_code)) {
    return false;
  }
  
  return true;
};

/**
 * Validate customer data
 * @param customerData - Customer information
 * @returns boolean - Whether the customer data is valid
 */
export const validateCustomerData = (customerData: CustomerData): boolean => {
  // Check required fields
  if (!customerData.email || !customerData.first_name || !customerData.last_name || !customerData.phone) {
    return false;
  }
  
  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
    return false;
  }
  
  // Validate phone format (simple check for Nigerian numbers)
  if (!/^\+?234\d{10}$|^\d{11}$/.test(customerData.phone)) {
    return false;
  }
  
  return true;
};

// Define the BVN data structure
export interface BvnData {
  bvn: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  account_number?: any;
  bank_code?: string;
  date_of_birth?: string; // YYYY-MM-DD format
}

// Define the response structure for BVN resolution
export interface BvnResolutionResponse {
  bvn: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  date_of_birth: string;
  phone: string;
  registration_date: string;
  image_base64: string;
  gender: string;
  email: string;
  nationality: string;
  residential_address: string;
  state_of_origin: string;
  lga_of_origin: string;
  lga_of_residence: string;
  marital_status: string;
  nin: string;
  verified: boolean;
  match_status: 'match' | 'no_match' | 'partial_match';
}

/**
 * Validate BVN data
 * @param bvnData - BVN information
 * @returns boolean - Whether the BVN data is valid
 */
export const validateBvnData = (bvnData: BvnData): boolean => {
  // Check required field
  if (!bvnData.bvn) {
    return false;
  }
  
  // Validate BVN format (should be 11 digits)
  if (!/^\d{11}$/.test(bvnData.bvn)) {
    return false;
  }
  
  return true;
};

/**
 * Resolve a BVN to verify identity
 * @param bvnData - BVN information
 * @param customerName - Customer's full name for comparison (optional)
 * @returns Promise<BvnResolutionResponse> - BVN verification details
 */
export const resolveBvn = async (
  bvnData: BvnData,
  customerName?: string
): Promise<BvnResolutionResponse> => {

  // console.log("BVN", bvnData)

  try {
    // Validate required fields
    if (!validateBvnData(bvnData)) {
      throw new Error("Invalid BVN data provided");
    }
    
    // Check if we're in test mode by looking at the secret key
    const secretKey = import.meta.env.VITE_PAYSTACK_SECRET_KEY;
    const isTestMode = secretKey && (secretKey.startsWith('sk_test_') || !secretKey.startsWith('sk_live_'));
    
    // If in test mode, return mock data to avoid hitting limits
    if (isTestMode) {
      return {
        bvn: bvnData.bvn,
        first_name: "Test",
        last_name: "User",
        middle_name: "Mock",
        date_of_birth: "1990-01-01",
        phone: "+2348012345678",
        registration_date: new Date().toISOString(),
        image_base64: "",
        gender: "Male",
        email: "test@example.com",
        nationality: "Nigerian",
        residential_address: "123 Test Street, Lagos",
        state_of_origin: "Lagos",
        lga_of_origin: "Lagos Mainland",
        lga_of_residence: "Lagos Mainland",
        marital_status: "Single",
        nin: "12345678901",
        verified: true,
        match_status: "match"
      };
    }
    
    // Use the correct Paystack BVN verification endpoint
    // The /bvn/match endpoint is used for BVN verification with name matching
    const response = await fetch('https://api.paystack.co/bvn/match', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bvn: bvnData.bvn,
        first_name: bvnData.first_name,
        last_name: bvnData.last_name,
        middle_name: bvnData.middle_name || "",
        account_number: bvnData.account_number, // Optional but recommended
        bank_code: bvnData.bank_code,
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Paystack API error: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = `Paystack API error: ${errorData.message || response.statusText}`;
      } catch (parseError) {
        // If we can't parse the error as JSON, use the raw text
        if (errorText) {
          errorMessage = `Paystack API error: ${errorText}`;
        }
      }
      
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    
    // Check if the response has the expected structure
    if (!result.status || !result.data) {
      throw new Error("Invalid response from Paystack API");
    }
    console.log("result 002", result)
    // Return the BVN information with verification status
    return {
      bvn: bvnData.bvn,
      first_name: result.data.first_name,
      last_name: result.data.last_name,
      middle_name: result.data.middle_name || "",
      date_of_birth: result.data.date_of_birth || "",
      phone: result.data.mobile || "",
      registration_date: result.data.registration_date || "",
      image_base64: result.data.image_base64 || "",
      gender: result.data.gender || "",
      email: result.data.email || "",
      nationality: result.data.nationality || "",
      residential_address: result.data.residential_address || "",
      state_of_origin: result.data.state_of_origin || "",
      lga_of_origin: result.data.lga_of_origin || "",
      lga_of_residence: result.data.lga_of_residence || "",
      marital_status: result.data.marital_status || "",
      nin: result.data.nin || "",
      verified: result.status === true || result.status === "success",
      match_status: result.data.match_status || (customerName ? compareNames(customerName, `${result.data.first_name} ${result.data.middle_name} ${result.data.last_name}`) : 'match')
    };
  } catch (error: any) {
    console.error("Error resolving BVN:", error);
    throw new Error(error.message || "Failed to verify BVN. Please try again.");
  }
};
