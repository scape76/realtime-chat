import { db } from "@/lib/db";
import Link from "next/link";

import Button from "@/components/ui/Button";
import { getServerSession } from "next-auth";
import LogoutButton from "@/components/LogoutButton";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    return (
      <>
        <div>You are currently logged in as {session.user?.email}</div>
        <LogoutButton />
      </>
    );
  }

  return (
    <div className="p-5">
      <Link href="/login">
        <Button variant="ghost">Login</Button>
      </Link>
    </div>
  );
}
