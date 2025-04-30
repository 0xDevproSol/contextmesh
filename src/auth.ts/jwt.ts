// src/auth/jwt.ts

import jwt from 'jsonwebtoken';
import config from '../config';

export interface JwtPayload {
  sub: string;         // subject, e.g. user or wallet identifier
  iat?: number;
  exp?: number;
  [key: string]: any;  // additional custom claims
}

/**
 * Generate a signed JWT.
 *
 * @param payload - The payload object to encode (must include `sub`).
 * @returns A signed JWT string.
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

/**
 * Verify and decode a JWT.
 *
 * @param token - The JWT string to verify.
 * @returns The decoded payload if valid.
 * @throws If the token is invalid or expired.
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
}
