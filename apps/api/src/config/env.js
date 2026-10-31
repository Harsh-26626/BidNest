import "dotenv/config";

const need = (k) => {
  if (!process.env[k]) throw new Error(`Missing env ${k}`);
  return process.env[k];
};

export const env = {
  PORT: process.env.PORT || 4000,
  JWT_SECRET: need("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  WEB_ORIGIN: process.env.WEB_ORIGIN || "http://localhost:5173",
};
