declare module 'speakeasy' {
  export interface GenerateSecretOptions {
    name?: string;
    length?: number;
    symbols?: boolean;
    qr_codes?: boolean;
    google_auth_qr?: boolean;
    issuer?: string;
  }

  export interface GeneratedSecret {
    ascii: string;
    hex: string;
    base32: string;
    qr_code_ascii?: string;
    qr_code_hex?: string;
    qr_code_base32?: string;
    google_auth_qr?: string;
    otpauth_url?: string;
  }

  export interface TotpVerifyOptions {
    secret: string;
    encoding?: string;
    token: string;
    window?: number;
    time?: number;
    step?: number;
  }

  export interface TotpOptions {
    secret: string;
    encoding?: string;
    time?: number;
    step?: number;
    counter?: number;
    digits?: number;
    algorithm?: string;
  }

  export function generateSecret(options?: GenerateSecretOptions): GeneratedSecret;

  export namespace totp {
    function verify(options: TotpVerifyOptions): boolean;
    function generate(options: TotpOptions): string;
  }
}
