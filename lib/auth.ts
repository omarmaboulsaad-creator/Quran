import { cookies } from "next/headers";
import crypto from "node:crypto";
import { db } from "./db";

const COOKIE = "hafez_session";
const secret = () => process.env.AUTH_SECRET || "development-only-secret";

function sign(id:string) {
  const sig = crypto.createHmac("sha256", secret()).update(id).digest("hex");
  return `${id}.${sig}`;
}
function verify(value:string) {
  const [id,sig] = value.split(".");
  if(!id || !sig) return null;
  const expected = crypto.createHmac("sha256", secret()).update(id).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) ? id : null;
}
export async function setSession(userId:string) {
  const jar = await cookies();
  jar.set(COOKIE, sign(userId), {httpOnly:true, sameSite:"lax", secure:process.env.NODE_ENV==="production", path:"/", maxAge:60*60*24*30});
}
export async function getCurrentUser() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  const id = raw ? verify(raw) : null;
  if(!id) return null;
  return db.user.findUnique({where:{id}});
}
export async function clearSession(){ (await cookies()).delete(COOKIE); }