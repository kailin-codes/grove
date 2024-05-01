import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import type { ReactNode } from "react";

interface AuthWrapperProps {
  children: ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Do nothing while loading
    if (!session && router.pathname.startsWith("/app")) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  return <>{children}</>;
};

export default AuthWrapper;
