"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "@/services/auth";
import { Role } from "@/services/role";

type Props = {
  roles?: Role[];
  children: React.ReactNode;
};

export default function RequireRole({ roles = [], children }: Props) {
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    if (!auth) {
      router.replace("/login");
      return;
    }

    if (roles.length && !roles.includes(auth.role)) {
      router.replace("/unauthorized");
    }
  }, [auth, roles, router]);

  if (!auth || (roles.length && !roles.includes(auth.role))) return null;

  return <>{children}</>;
}