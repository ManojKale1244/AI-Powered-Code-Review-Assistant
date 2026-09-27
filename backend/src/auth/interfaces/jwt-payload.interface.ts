/**
 * JWT payload shape stored in the token.
 * Keep it minimal — tokens are sent with every request.
 */
export interface JwtPayload {
  sub: string; // User ID (standard JWT claim name)
  email: string;
}
