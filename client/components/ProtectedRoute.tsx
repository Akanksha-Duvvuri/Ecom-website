"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) { //children is whatever page or component is wrapped inside the >protectedroute> tag
//React.reactnode means it can be any valid jsx
  const router = useRouter();
  const [checking, setChecking] = useState(true);  //starts as true - so checking is initally true until authenticated. 

  useEffect(() => { //auth check
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
      else setChecking(false);  //auth done
    });
    return () => unsub();
  }, []);

  if (checking) return (
    <div style={{ background: "#0f0f0f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#555", fontSize: 14 }}>Loading...</p>
    </div>
  );

  return <>{children}</>;  //once is loads - returns the child page which was wrapped in protectedroute ka tag
}