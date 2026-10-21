import "server-only";
import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cache } from "react";
import { cookies } from "next/headers";
import { query } from "./db";

// Cuentas del panel: una por persona, con clave propia. Las sesiones viven en la base de datos (se pueden cerrar
// desde el servidor: al desactivar a alguien o cambiar su clave caen sus sesiones abiertas). En la cookie solo
// viaja un código al azar; en la base se guarda su huella, no el código.

export const SESSION_COOKIE = "admin_s";
export const SESSION_DAYS = 14;
const BOOTSTRAP_HOURS = 12;
export const MIN_PASSWORD = 10;

export type Actor = {
  id: number | null; // null: sesión de instalación (clave ADMIN_PASSWORD, antes de existir cuentas)
  username: string;
  name: string;
  mustChange: boolean; // la clave la puso otra persona: debe cambiarla antes de usar el panel
  bootstrap: boolean;
};

export type AdminUser = {
  id: number;
  username: string;
  name: string;
  active: boolean;
  mustChange: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

type UserRow = {
  id: number;
  username: string;
  name: string;
  password_hash: string;
  active: boolean;
  must_change: boolean;
  created_at: string | Date;
  last_login_at: string | Date | null;
};

const scrypt = promisify(scryptCb) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const iso = (v: string | Date | null) => (v == null ? null : new Date(v).toISOString());

// ---- Claves

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `s1$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export async function verifyPassword(stored: string, password: string) {
  const [v, salt, hash] = stored.split("$");
  if (v !== "s1" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = await scrypt(password, Buffer.from(salt, "base64url"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// Para que entrar con un usuario que no existe tarde lo mismo que con uno que sí existe.
let dummy: Promise<string> | undefined;
export async function burnPasswordCheck(password: string) {
  dummy ??= hashPassword("clave-que-nadie-usa");
  await verifyPassword(await dummy, password);
}

export const PASSWORD_PROBLEMS = {
  corta: `La clave debe tener al menos ${MIN_PASSWORD} caracteres.`,
  larga: "La clave es demasiado larga (máximo 200 caracteres).",
  repetitiva: "La clave es demasiado repetitiva. Usa letras, números o una frase.",
  usuario: "La clave no puede apoyarse en el nombre de usuario. Usa una frase que no lo repita.",
} as const;
export type PasswordProblem = keyof typeof PASSWORD_PROBLEMS;

export function passwordProblem(password: string, username = ""): PasswordProblem | null {
  if (password.length < MIN_PASSWORD) return "corta";
  if (password.length > 200) return "larga";
  if (new Set(password).size < 4) return "repetitiva";
  // Sin el nombre de usuario, lo que queda debe seguir cumpliendo el largo mínimo (así «ana12345678» no pasa, pero una frase que lo menciona sí).
  if (username && password.toLowerCase().split(username.toLowerCase()).join("").length < MIN_PASSWORD) return "usuario";
  return null;
}

// Clave de instalación (variable ADMIN_PASSWORD), comparación de tiempo constante.
export function installPasswordMatches(input: string) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  return timingSafeEqual(createHash("sha256").update(input).digest(), createHash("sha256").update(password).digest());
}

// ---- Usuarios

export const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{2,29}$/;
export const normalizeUsername = (v: string) => v.trim().toLowerCase();

const toUser = (r: UserRow): AdminUser => ({
  id: Number(r.id),
  username: r.username,
  name: r.name,
  active: Boolean(r.active),
  mustChange: Boolean(r.must_change),
  createdAt: iso(r.created_at)!,
  lastLoginAt: iso(r.last_login_at),
});

export async function listUsers() {
  const rows = await query<UserRow>(`SELECT * FROM admin_users ORDER BY active DESC, created_at, id`);
  return rows.map(toUser);
}

export async function countActiveUsers() {
  const [r] = await query<{ n: number | string }>(`SELECT count(*)::int AS n FROM admin_users WHERE active`);
  return Number(r?.n ?? 0);
}

export async function getUserRowByUsername(username: string) {
  const [r] = await query<UserRow>(`SELECT * FROM admin_users WHERE username = $1`, [username]);
  return r ?? null;
}

export async function getUser(id: number) {
  const [r] = await query<UserRow>(`SELECT * FROM admin_users WHERE id = $1`, [id]);
  return r ? toUser(r) : null;
}

// Devuelve null si el usuario ya existe.
export async function createUser(input: { username: string; name: string; password: string; mustChange: boolean }) {
  const hash = await hashPassword(input.password);
  const rows = await query<UserRow>(
    `INSERT INTO admin_users (username, name, password_hash, must_change) VALUES ($1, $2, $3, $4)
     ON CONFLICT (username) DO NOTHING RETURNING *`,
    [input.username, input.name, hash, input.mustChange],
  );
  return rows[0] ? toUser(rows[0]) : null;
}

export async function setUserPassword(id: number, password: string, mustChange: boolean) {
  const hash = await hashPassword(password);
  await query(`UPDATE admin_users SET password_hash = $2, must_change = $3 WHERE id = $1`, [id, hash, mustChange]);
}

export async function setUserName(id: number, name: string) {
  await query(`UPDATE admin_users SET name = $2 WHERE id = $1`, [id, name]);
}

export async function setUserActive(id: number, active: boolean) {
  // Nunca se deja la tienda sin ninguna cuenta activa.
  const rows = active
    ? await query<UserRow>(`UPDATE admin_users SET active = true WHERE id = $1 RETURNING *`, [id])
    : await query<UserRow>(
        `UPDATE admin_users SET active = false WHERE id = $1 AND (SELECT count(*) FROM admin_users WHERE active AND id <> $1) > 0 RETURNING *`,
        [id],
      );
  if (rows[0] && !active) await endUserSessions(id);
  return Boolean(rows[0]);
}

export async function touchLogin(id: number) {
  await query(`UPDATE admin_users SET last_login_at = now() WHERE id = $1`, [id]);
}

// ---- Sesiones

export async function startSession(userId: number | null) {
  const token = randomBytes(32).toString("base64url");
  const ms = userId == null ? BOOTSTRAP_HOURS * 3600_000 : SESSION_DAYS * 86400_000;
  await query(`DELETE FROM admin_sessions WHERE expires_at < now()`);
  await query(`INSERT INTO admin_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)`, [sha256(token), userId, new Date(Date.now() + ms).toISOString()]);
  return { token, maxAge: Math.floor(ms / 1000) };
}

export async function endSession(token: string) {
  await query(`DELETE FROM admin_sessions WHERE token_hash = $1`, [sha256(token)]);
}

// Cierra las sesiones de una persona (opcionalmente conserva la que está usando ahora).
export async function endUserSessions(userId: number, keepToken?: string) {
  if (keepToken) await query(`DELETE FROM admin_sessions WHERE user_id = $1 AND token_hash <> $2`, [userId, sha256(keepToken)]);
  else await query(`DELETE FROM admin_sessions WHERE user_id = $1`, [userId]);
}

export const sessionCookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/admin",
  maxAge,
});

type SessionRow = { user_id: number | null; username: string | null; name: string | null; active: boolean | null; must_change: boolean | null };

// Persona con sesión abierta, o null. Una consulta por solicitud.
export const currentActor = cache(async (): Promise<Actor | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const [s] = await query<SessionRow>(
    `SELECT s.user_id, u.username, u.name, u.active, u.must_change
       FROM admin_sessions s LEFT JOIN admin_users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [sha256(token)],
  );
  if (!s) return null;
  if (s.user_id == null) {
    // Sesión de instalación: solo vale mientras no exista ninguna cuenta y la clave ADMIN_PASSWORD siga configurada.
    if (!process.env.ADMIN_PASSWORD || (await countActiveUsers()) > 0) return null;
    return { id: null, username: "instalacion", name: "Clave de instalación", mustChange: false, bootstrap: true };
  }
  if (!s.active || !s.username || !s.name) return null;
  return { id: Number(s.user_id), username: s.username, name: s.name, mustChange: Boolean(s.must_change), bootstrap: false };
});

export async function currentToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}
