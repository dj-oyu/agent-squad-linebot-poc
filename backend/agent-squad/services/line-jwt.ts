import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

/**
 * LINE IDトークン（JWT）を検証し、userIdを返す
 * @param idToken LINEログインで取得したIDトークン
 * @returns userId (sub)
 */
export async function verifyLineIdToken(idToken: string): Promise<string> {
  // LINEの公開鍵取得
  const client = jwksClient({
    jwksUri: "https://api.line.me/oauth2/v2.1/certs",
    cache: true,
    rateLimit: true,
  });

  function getKey(header: any, cb: any) {
    client.getSigningKey(header.kid, function (err, key) {
      const signingKey = key?.getPublicKey();
      cb(null, signingKey);
    });
  }

  return new Promise((resolve, reject) => {
    jwt.verify(
      idToken,
      getKey,
      {
        algorithms: ["RS256"],
        issuer: "https://access.line.me",
        audience: process.env.LINE_LOGIN_CHANNEL_ID,
      },
      (err, decoded: any) => {
        if (err) return reject(err);
        // decoded.subがLINE userId
        resolve(decoded.sub);
      }
    );
  });
}
