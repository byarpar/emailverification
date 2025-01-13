import { useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import Image from 'next/image'

interface SocialLoginButtonsProps {
  onGoogleLogin: () => void;
  onFacebookLogin: () => void;
}

export function SocialLoginButtons({ onGoogleLogin, onFacebookLogin }: SocialLoginButtonsProps) {
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && googleButtonRef.current) {
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: googleButtonRef.current.offsetWidth,
      });
    }
  }, []);

  return (
    <div className="flex flex-col space-y-4 w-full">
      <div 
        ref={googleButtonRef} 
        onClick={onGoogleLogin} 
        className="w-full h-10 sm:h-12 rounded-md overflow-hidden shadow-md hover:shadow-lg transition duration-300 ease-in-out"
      ></div>
      <Button
        type="button"
        variant="outline"
        onClick={onFacebookLogin}
        className="w-full flex items-center justify-center space-x-2 bg-[#1877F2] hover:bg-[#0c63d4] text-white border-[#1877F2] hover:border-[#0c63d4] transition-colors py-2 sm:py-3 text-sm sm:text-base rounded-md shadow-md hover:shadow-lg transition duration-300 ease-in-out"
      >
        <Image src="/facebook-icon-white.svg" alt="Facebook Logo" width={20} height={20} className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="font-semibold">Continue with Facebook</span>
      </Button>
    </div>
  )
}

