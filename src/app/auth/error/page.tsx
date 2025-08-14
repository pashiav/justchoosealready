"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

// Prevent prerendering - this page needs to be dynamic
export const dynamic = 'force-dynamic';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "OAuthCallback":
        return "OAuth callback error - check your Google OAuth configuration";
      case "OAuthSignin":
        return "OAuth sign-in error - check your Google OAuth credentials";
      case "OAuthCreateAccount":
        return "OAuth account creation error";
      case "OAuthAccountNotLinked":
        return "OAuth account not linked - try signing in with the same account";
      case "EmailSignin":
        return "Email sign-in error";
      case "CredentialsSignin":
        return "Credentials sign-in error";
      case "SessionRequired":
        return "Session required - please sign in";
      case "Default":
        return "Authentication error occurred";
      default:
        return `Unknown error: ${error}`;
    }
  };

  const getErrorDetails = (error: string | null) => {
    switch (error) {
      case "OAuthCallback":
        return [
          "1. Check your Google Cloud Console OAuth 2.0 configuration",
          "2. Verify authorized redirect URIs include: http://localhost:3000/api/auth/callback/google",
          "3. Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct",
          "4. Check that Google+ API is enabled in your project"
        ];
      case "OAuthSignin":
        return [
          "1. Verify your Google OAuth credentials are correct",
          "2. Check that your OAuth consent screen is properly configured",
          "3. Ensure your app is not in testing mode or add your email as a test user"
        ];
      default:
        return [
          "Check your environment variables",
          "Verify your OAuth configuration",
          "Check the browser console for more details"
        ];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
      <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-[#2d2e40] mb-2">
            Authentication Error
          </h1>
          <p className="text-gray-600">
            {getErrorMessage(error)}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Troubleshooting Steps:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            {getErrorDetails(error).map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="text-[#ef4e2d] mr-2">•</span>
                {step}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <Link href="/" className="w-full">
            <Button className="w-full bg-[#ef4e2d] hover:bg-[#d63d1a]">
              Go Home
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Debug Info:</strong> Error: {error || "unknown"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
            <h1 className="text-2xl font-bold text-[#2d2e40] mb-2">
              Loading...
            </h1>
          </div>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
