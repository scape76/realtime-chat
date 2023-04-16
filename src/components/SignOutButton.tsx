"use client";

import { Loader2, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { ButtonHTMLAttributes, FC, useState } from "react";
import { toast } from "react-hot-toast";

import Button from "./ui/Button";

interface SignOutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const SignOutButton: FC<SignOutButtonProps> = ({ ...props }) => {
  const [isSigninOut, setIsSigninOut] = useState(false);

  const handleClick = async () => {
    setIsSigninOut(true);
    try {
      await signOut();
    } catch (err) {
      toast.error("There was a problem signing out");
    } finally {
      setIsSigninOut(false);
    }
  };

  return (
    <Button {...props} variant="ghost" onClick={handleClick}>
      {isSigninOut ? <Loader2 className="animate-spin h-4 w-4"/> : (
        <LogOut className="h-4 w-4"/>
      )}
    </Button>
  );
};

export default SignOutButton;
