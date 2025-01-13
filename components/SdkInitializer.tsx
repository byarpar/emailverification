'use client'

import { useEffect } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB?: {
      init: (config: FacebookInitParams) => void;
      login: (callback: (response: FacebookLoginResponse) => void, config: FacebookLoginParams) => void;
    };
  }
}

interface FacebookInitParams {
  appId: string | undefined;
  cookie: boolean;
  xfbml: boolean;
  version: string;
}

interface FacebookLoginResponse {
  authResponse: {
    accessToken: string;
    expiresIn: number;
    signedRequest: string;
    userID: string;
  } | null;
  status: 'connected' | 'not_authorized' | 'unknown';
}

interface FacebookLoginParams {
  scope: string;
}

export function SdkInitializer() {
  useEffect(() => {
    // Initialize Facebook SDK
    window.fbAsyncInit = function() {
      window.FB?.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v11.0'
      });
    };

    // Load Facebook SDK
    (function(d, s, id) {
      const fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      const js = d.createElement(s) as HTMLScriptElement; 
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode!.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }, []);

  return (
    <>
      <Script
        src={`https://accounts.google.com/gsi/client`}
        strategy="lazyOnload"
      />
    </>
  )
}

