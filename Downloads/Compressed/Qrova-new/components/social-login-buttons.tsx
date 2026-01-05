"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"

interface SocialLoginButtonsProps {
  onGoogleLogin: () => Promise<void>
  onFacebookLogin?: () => Promise<void>
  onAppleLogin?: () => Promise<void>
  disabled?: boolean
}

export function SocialLoginButtons({ 
  onGoogleLogin, 
  onFacebookLogin, 
  onAppleLogin, 
  disabled = false 
}: SocialLoginButtonsProps) {
  const [loadingStates, setLoadingStates] = useState({
    google: false,
    facebook: false,
    apple: false
  });

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple', loginFn: () => Promise<void>) => {
    setLoadingStates(prev => ({ ...prev, [provider]: true }));
    try {
      await loginFn();
    } finally {
      setLoadingStates(prev => ({ ...prev, [provider]: false }));
    }
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 border-gray-700/30 bg-[#1a212b]/50 hover:bg-[#1a212b] hover:border-gray-600/50 transition-all duration-200"
        onClick={() => handleSocialLogin('google', onGoogleLogin)}
        disabled={disabled || loadingStates.google}
      >
        {loadingStates.google ? (
          <div className="w-5 h-5 mr-3 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
        ) : (
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.7663 12.2764C23.7663 11.4607 23.7001 10.6406 23.559 9.83807H12.2402V14.4591H18.722C18.453 15.9494 17.5888 17.2678 16.3233 18.1056V21.1039H20.1903C22.4611 19.0139 23.7663 15.9274 23.7663 12.2764Z" fill="#4285F4"/>
            <path d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3276 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z" fill="#34A853"/>
            <path d="M5.50253 14.3003C4.99987 12.8099 4.99987 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="#FBBC04"/>
            <path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="#EA4335"/>
          </svg>
        )}
        <span>Continue with Google</span>
      </Button>

      {onFacebookLogin && (
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 border-gray-700/30 bg-[#1a212b]/50 hover:bg-[#1a212b] hover:border-gray-600/50 transition-all duration-200"
          onClick={() => handleSocialLogin('facebook', onFacebookLogin)}
          disabled={disabled || loadingStates.facebook}
        >
          {loadingStates.facebook ? (
            <div className="w-5 h-5 mr-3 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
          ) : (
            <svg className="w-5 h-5 mr-3" fill="#1877F2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          )}
          <span>Continue with Facebook</span>
        </Button>
      )}

      {onAppleLogin && (
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 border-gray-700/30 bg-[#1a212b]/50 hover:bg-[#1a212b] hover:border-gray-600/50 transition-all duration-200"
          onClick={() => handleSocialLogin('apple', onAppleLogin)}
          disabled={disabled || loadingStates.apple}
        >
          {loadingStates.apple ? (
            <div className="w-5 h-5 mr-3 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
          ) : (
            <svg className="w-5 h-5 mr-3" fill="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"/>
            </svg>
          )}
          <span>Continue with Apple</span>
        </Button>
      )}
    </div>
  );
} 