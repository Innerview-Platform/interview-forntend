import type { Metadata } from "next";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function SignupPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 sm:py-16">
      <SignupForm />
    </div>
  );
}
