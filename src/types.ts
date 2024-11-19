import { Context } from "hono";
import { JWTPayload } from "hono/utils/jwt/types";

export type Bindings = {
    FASTPASS_GATEWAY_KEY: string
    FASTPASS_MERCHANT_KEY: string
    DB: D1Database
}

// Define las variables personalizadas para el contexto
interface AuthVariables {
    payload: JWTPayload;
}

// Tipo para el contexto autenticado
export type AuthContext = Context<{
    Bindings: Bindings,
    Variables: AuthVariables;
    JWT: JWTPayload; // Esto es importante para que Hono sepa del payload
}>;