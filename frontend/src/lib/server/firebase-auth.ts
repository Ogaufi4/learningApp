import { createRemoteJWKSet, jwtVerify } from "jose";

type FirebaseTokenPayload = {
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  sub: string;
};

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

export async function verifyFirebaseIdToken(token: string): Promise<FirebaseTokenPayload> {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error("Missing required environment variable: FIREBASE_PROJECT_ID");
  }

  const { payload } = await jwtVerify(token, GOOGLE_JWKS, {
    algorithms: ["RS256"],
    audience: projectId,
    issuer: `https://securetoken.google.com/${projectId}`,
  });

  return payload as unknown as FirebaseTokenPayload;
}
