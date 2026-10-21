import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { endSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token && token.length <= 100) await endSession(token);
  const res = NextResponse.redirect(new URL("/admin", req.url), 303);
  res.cookies.delete({ name: SESSION_COOKIE, path: "/admin" });
  res.cookies.delete({ name: "admin", path: "/admin" });
  return res;
}
