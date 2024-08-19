"use client";

import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useAppContext } from "@/contexts/app";

// Extend the Window interface to include the google property
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: any) => void;
          prompt: (callback: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          cancel: () => void;
        };
      };
    };
  }
}

export default function useOneTapLogin() {
  const { data: session, status } = useSession();
  const { setLoading } = useAppContext();

  const oneTapLogin = async function () {
    if (typeof window === 'undefined' || !window.google || !window.google.accounts) {
      console.error('Google One Tap not available');
      return;
    }

    const options = {
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      auto_select: false,
      cancel_on_tap_outside: false,
      context: "signin",
    };

    window.google.accounts.id.initialize(options);
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // continue with another identity provider here
        console.log('One Tap not displayed');
      }
    });

    const buttonElement = document.getElementById("googleOneTap");
    if (buttonElement) {
      window.google.accounts.id.renderButton(
        buttonElement,
        { theme: "outline", size: "large" }
      );
    }
  };

  const handleLogin = async function (response: any) {
    setLoading(true);
    try {
      const res = await signIn("google-one-tap", {
        credential: response.credential,
        redirect: false,
      });
      console.log("signIn ok", res);
      // Handle successful sign-in here
    } catch (error) {
      console.error("Sign-in error:", error);
      // Handle sign-in error here
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        oneTapLogin();
      };

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [status]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && window.google.accounts) {
      window.google.accounts.id.cancel();
    }
  }, [session]);

  return { handleLogin };
}