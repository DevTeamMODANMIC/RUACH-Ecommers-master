// Nigerian Bank Codes for Paystack Integration
export interface NigerianBank {
  name: string;
  code: string;
}

export const NIGERIAN_BANKS: NigerianBank[] = [
  { name: "Access Bank", code: "044" },
  { name: "Access Bank (Diamond)", code: "063" },
  { name: "ALAT by WEMA", code: "035A" },
  { name: "ASO Savings and Loans", code: "401" },
  { name: "Bowen Microfinance Bank", code: "50931" },
  { name: "CEMCS Microfinance Bank", code: "50823" },
  { name: "Citibank Nigeria", code: "023" },
  { name: "Ecobank Nigeria", code: "050" },
  { name: "Fidelity Bank", code: "070" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "First City Monument Bank", code: "214" },
  { name: "Globus Bank", code: "103" },
  { name: "Guaranty Trust Bank", code: "058" },
  { name: "Heritage Bank", code: "030" },
  { name: "Jaiz Bank", code: "301" },
  { name: "Keystone Bank", code: "082" },
  { name: "Kuda Bank", code: "50211" },
  { name: "One Finance", code: "565" },
  { name: "Parallex Bank", code: "526" },
  { name: "Paycom Nigeria (Opay)", code: "999992" },
  { name: "Polaris Bank", code: "076" },
  { name: "Providus Bank", code: "101" },
  { name: "Rubies MFB", code: "125" },
  { name: "Sparkle Microfinance Bank", code: "51310" },
  { name: "Stanbic IBTC Bank", code: "221" },
  { name: "Standard Chartered Bank", code: "068" },
  { name: "Sterling Bank", code: "232" },
  { name: "Suntrust Bank", code: "100" },
  { name: "TAJBank", code: "302" },
  { name: "TCF MFB", code: "51211" },
  { name: "Titan Bank", code: "102" },
  { name: "Union Bank of Nigeria", code: "032" },
  { name: "United Bank for Africa", code: "033" },
  { name: "Unity Bank", code: "215" },
  { name: "VFD Microfinance Bank", code: "566" },
  { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" }
];

// Sort banks alphabetically by name
NIGERIAN_BANKS.sort((a, b) => a.name.localeCompare(b.name));

// Function to get bank name by code
export const getBankNameByCode = (code: string): string | undefined => {
  const bank = NIGERIAN_BANKS.find(bank => bank.code === code);
  return bank ? bank.name : undefined;
};

// Function to get bank code by name
export const getBankCodeByName = (name: string): string | undefined => {
  const bank = NIGERIAN_BANKS.find(bank => bank.name === name);
  return bank ? bank.code : undefined;
};

export const getCurrentBanksInfo = async()=>{
  // import.meta.env.VITE_PAYSTACK_SECRET_KEY
  const url = "https://api.paystack.co/bank";
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Error:", response.status, response.statusText);
      return;
    }

    const data = await response.json();
    console.log("✅ Banks retrieved successfully");
    console.log(data);
    return data.data.map(v=> {
      return {name: v.name, code: v.code}
    } )
  } catch (error) {
    console.error("❌ Request failed:", error.message);
  }

}