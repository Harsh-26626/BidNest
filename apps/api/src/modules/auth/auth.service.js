import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../lib/httpError.js";
import { env } from "../../config/env.js";

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });
const sign = (u) => jwt.sign({ sub: u.id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

export async function register({ name, email, password }) {
  if (await prisma.user.findUnique({ where: { email } })) {
    throw new HttpError(409, "EMAIL_TAKEN", "An account with this email already exists");
  }
  const user = await prisma.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 10) },
  });
  return { token: sign(user), user: publicUser(user) };
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) throw new HttpError(401, "UNAUTHORIZED", "Invalid email or password");
  return { token: sign(user), user: publicUser(user) };
}

export async function me(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new HttpError(401, "UNAUTHORIZED", "Account no longer exists");
  return { user: publicUser(user) };
}
