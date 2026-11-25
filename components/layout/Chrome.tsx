"use client";

import { usePathname } from "next/navigation";
import Navbar, { Stripe } from "./Navbar";
import SessionWatch from "./SessionWatch";
import useIsDesktop from "@/lib/useIsDesktop";

const AUTH_ROUTES = ["/login", "/register"];

export default function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const desk = useIsDesktop();

  // The admin shell has its own sidebar + top bar.
  if (pathname.startsWith("/dashboard"))
    return (
      <>
        {children}
        <SessionWatch />
      </>
    );

  const active = "/" + (pathname.split("/")[1] || "");
  const onAuth = AUTH_ROUTES.includes(pathname);
  const showTabbar = !desk && !onAuth;

  return (
    <>
      <div style={{ position: "sticky", top: 0, zIndex: 20 }}>
        <Stripe />
        <Navbar mode={desk ? "desktop" : "mobile"} active={active} />
      </div>
      {children}
      <SessionWatch />
      {showTabbar ? (
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 30 }}>
          <Navbar mode="tabbar" active={active} />
        </div>
      ) : null}
    </>
  );
}
