"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminGatePage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const adminEmail = localStorage.getItem("admin_email");
    if (adminEmail) router.push("/admin/home");
    else router.push("/admin/login");
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#F3F4F6" }}>
      <p style={{ color: "#6B7280" }}>Redirecting…</p>
    </div>
  );
}
