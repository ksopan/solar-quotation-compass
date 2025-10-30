import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Mail } from "lucide-react";

export default function VerificationSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const verified = searchParams.get("verified");
  const email = searchParams.get("email");

  useEffect(() => {
    // If already verified, show different message
    if (verified === "already") {
      console.log("Email already verified");
    } else if (verified === "success") {
      console.log("Email verified successfully");
    }
  }, [verified]);

  const isAlreadyVerified = verified === "already";
  const isSuccess = verified === "success";

  if (!isSuccess && !isAlreadyVerified) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {isAlreadyVerified ? "Already Verified!" : "Email Verified!"}
          </h1>
          <p className="text-gray-600">
            {isAlreadyVerified
              ? "Your email has already been verified. Your quotation request is active."
              : "Your email has been successfully verified! Your quotation request is now active and vendors have been notified."}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-center gap-2 text-blue-700">
            <Mail className="h-5 w-5" />
            <span className="font-medium">What's Next?</span>
          </div>
          <p className="text-sm text-blue-600">
            You'll receive email notifications when vendors submit their proposals. Create an
            account to track and compare all proposals in one place.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate("/register")}
            className="w-full"
            size="lg"
          >
            Create Account
          </Button>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Back to Home
          </Button>
        </div>

        {email && (
          <p className="text-xs text-gray-500">
            We've sent a confirmation to <span className="font-medium">{email}</span>
          </p>
        )}
      </Card>
    </div>
  );
}
