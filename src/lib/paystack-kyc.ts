/**
 * Paystack KYC Integration for Customer Creation and Bank Account Verification
 * This module handles the first two steps of the KYC process:
 * 1. Create customer → get CUS_xxx
 * 2. Resolve bank account /bank/resolve → confirm account name matches
 */

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
    console.log(result)
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
    
    // In a production environment, you would use the actual Paystack API:
    /*
    const response = await fetch(`https://api.paystack.co/bank/resolve?account_number=${bankAccountData.account_number}&bank_code=${bankAccountData.bank_code}`, {
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
    const resolvedAccountName = result.data.account_name;
    */
    
    // For demonstration purposes, we'll simulate the response
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate mock account name (in a real implementation, this would come from Paystack)
    // If customerName is provided, use it as the account name, otherwise generate a realistic name
    let resolvedAccountName = "";
    if (customerName && customerName.trim()) {
      resolvedAccountName = customerName.trim();
    } else if (bankAccountData.account_name && bankAccountData.account_name.trim()) {
      resolvedAccountName = bankAccountData.account_name.trim();
    } else {
      // Generate a realistic account name based on common Nigerian names
      const nigerianNames = [
        "Adewale Johnson", "Chidinma Okonkwo", "Emeka Adeyemi", "Fatima Abubakar",
        "Gbenga Ogunjobi", "Hassan Ali", "Ifeoma Nwosu", "Jibril Mohammed",
        "Kehinde Adebayo", "Lanre Olatunji", "Musa Ibrahim", "Ngozi Eze",
        "Oluwatobi Afolabi", "Peace Adekunle", "Queen Okafor", "Rasheed Balogun"
      ];
      resolvedAccountName = nigerianNames[Math.floor(Math.random() * nigerianNames.length)];
    }
    
    // Compare account name with customer name
    const matchStatus = compareNames(customerName, resolvedAccountName);
    
    // Return mock response
    return {
      account_number: bankAccountData.account_number,
      account_name: resolvedAccountName,
      bank_code: bankAccountData.bank_code,
      bank_name: "Test Bank",
      verified: matchStatus !== 'no_match',
      match_status: matchStatus
    };
  } catch (error) {
    console.error("Error resolving bank account:", error);
    throw error;
  }
};

/**
 * Simulate resolving a bank from an account number
 * In a real implementation, this would call the Paystack API
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
export const handleVerifyBankAccount = (bankAccountData: BankAccountData): boolean => {
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
  try {
    // Validate required fields
    if (!validateBvnData(bvnData)) {
      throw new Error("Invalid BVN data provided");
    }
    
    // In a production environment, you would use the actual Paystack API:
    /*
    const response = await fetch('https://api.paystack.co/bank/resolve_bvn', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bvn: bvnData.bvn,
        first_name: bvnData.first_name,
        last_name: bvnData.last_name,
        middle_name: bvnData.middle_name,
        date_of_birth: bvnData.date_of_birth
      })
    });
    
    if (!response.ok) {
      throw new Error(`Paystack API error: ${response.statusText}`);
    }
    
    const result = await response.json();
    */
    
    // For demonstration purposes, we'll simulate the response
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock response
    const mockResponse: BvnResolutionResponse = {
      bvn: bvnData.bvn,
      first_name: bvnData.first_name || "John",
      last_name: bvnData.last_name || "Doe",
      middle_name: bvnData.middle_name || "Middle",
      date_of_birth: bvnData.date_of_birth || "1990-01-01",
      phone: "+2348012345678",
      registration_date: "2020-01-01",
      image_base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
      gender: "Male",
      email: "john.doe@example.com",
      nationality: "Nigerian",
      residential_address: "123 Main Street, Lagos",
      state_of_origin: "Lagos",
      lga_of_origin: "Lagos Mainland",
      lga_of_residence: "Lagos Island",
      marital_status: "Single",
      nin: "12345678901",
      verified: true,
      match_status: customerName ? compareNames(customerName, `${bvnData.first_name || "John"} ${bvnData.middle_name || "Middle"} ${bvnData.last_name || "Doe"}`) : 'match'
    };
    
    return mockResponse;
  } catch (error) {
    console.error("Error resolving BVN:", error);
    throw error;
  }
};