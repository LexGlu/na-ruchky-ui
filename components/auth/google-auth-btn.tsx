"use client";

import React, { useEffect, useRef } from "react";
import Script from "next/script";

import { GOOGLE_CLIENT_ID } from "@/lib/api/constants";

import { PuffLoader } from "react-spinners";

// Define interfaces for Google credential response
interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccountsType {
  id: {
    initialize: (config: {
      client_id: string;
      callback: (response: GoogleCredentialResponse) => void;
    }) => void;
    renderButton: (
      element: HTMLElement,
      options: {
        type: string;
        theme: string;
        size: string;
        text: string;
        shape: string;
        width: number;
      }
    ) => void;
  };
}

// Extend Window interface to include google property
interface WindowWithGoogle extends Window {
  google?: {
    accounts: GoogleAccountsType;
  };
}

interface GoogleAuthButtonProps {
  onSuccess: () => void;
  onError: (message: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  googleLogin: (credential: string) => Promise<void>;
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onSuccess,
  onError,
  isLoading,
  setIsLoading,
  googleLogin,
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const googleInitialized = useRef<boolean>(false);

  const handleGoogleCredentialResponse = async (
    response: GoogleCredentialResponse
  ) => {
    try {
      setIsLoading(true);
      await googleLogin(response.credential);
      onSuccess();
    } catch (err: unknown) {
      // Use type assertion to handle the error
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred during Google sign-in.";
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeGoogleOneTap = () => {
    if (
      typeof window !== "undefined" &&
      (window as WindowWithGoogle).google &&
      buttonRef.current
    ) {
      const googleAccounts = (window as WindowWithGoogle).google?.accounts;

      if (googleAccounts) {
        googleAccounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID!,
          callback: handleGoogleCredentialResponse,
        });

        // Render the button with more rounded style
        googleAccounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "pill", // Making the button more rounded
          width: 260,
        });

        googleInitialized.current = true;
      }
    }
  };

  useEffect(() => {
    if ((window as WindowWithGoogle).google && !googleInitialized.current) {
      initializeGoogleOneTap();
    }
  }, [initializeGoogleOneTap]); // Added missing dependency

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={initializeGoogleOneTap}
        strategy="lazyOnload"
      />
      <div className="flex justify-center mt-2">
        {isLoading ? (
          <PuffLoader color="#4285F4" size={30} />
        ) : (
          <div ref={buttonRef} className="google-login-button" />
        )}
      </div>
    </>
  );
};

export default GoogleAuthButton;
