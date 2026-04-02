import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function OTPForm() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black p-4 sm:p-6">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-white shadow-2xl">
        <CardHeader className="space-y-2 text-center sm:text-left">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Verify Your Account
          </CardTitle>
          <p className="text-sm text-zinc-400">
            We've sent a verification code to your email. Please enter it below.
          </p>
        </CardHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // TODO: Xử lý logic gọi API Verify OTP ở đây
          }}
        >
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verification-code" className="text-zinc-300">
                Verification Code
              </Label>
              <Input
                id="verification-code"
                name="verification_code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter your code"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-green-500 text-center text-xl tracking-widest"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button type="submit" className="w-full bg-green-500 text-black hover:bg-green-600 font-semibold">
              Verify Account
            </Button>
            <div className="flex flex-col space-y-2 mt-2 w-full text-center text-sm">
              <p className="text-zinc-400">
                Didn't receive the code?{" "}
                <button type="button" className="text-green-400 font-medium underline-offset-4 hover:underline hover:text-green-300">
                  Resend code
                </button>
              </p>
              <Link
                to="/login"
                className="text-zinc-500 font-medium underline-offset-4 hover:underline hover:text-zinc-300 mt-2"
              >
                Back to sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}