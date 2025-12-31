export const isMonnifyTestMode = () => {
    const isLive = import.meta.env.VITE_MONNIFY_IS_LIVE;
    return isLive !== 'true';
};

// Get Monnify API base URL based on environment
export const getMonnifyApiBaseUrl = ():string => {
    return isMonnifyTestMode()
        ? 'https://sandbox.monnify.com'
        : 'https://api.monnify.com';
};
