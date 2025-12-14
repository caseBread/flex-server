// pages/api/_utils/auth.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { verifyToken } from "../token/refresh-token";

export type AuthedReq = NextApiRequest & { user?: any };

const cors = Cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise<void>((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve();
    });
  });
}

function extractBearer(auth?: string) {
  if (!auth) return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

/**
 * - CORS 처리
 * - Authorization: Bearer <token> 있으면 access 토큰만 허용하고 req.user 주입
 * - 토큰이 없으면 req.user는 undefined (비로그인 취급)
 */
export async function applyCorsAndAuth(req: AuthedReq, res: NextApiResponse) {
  await runMiddleware(req, res, cors);

  const token = extractBearer(req.headers.authorization);
  if (!token) return;

  try {
    const decoded: any = verifyToken(token);
    if (decoded?.type !== "access") {
      res.status(401).json({ message: "invalid access token" });
      throw new Error("STOP");
    }
    req.user = decoded;
  } catch (e: any) {
    if (e?.message === "STOP") throw e;
    res.status(401).json({ message: "invalid or expired access token" });
    throw new Error("STOP");
  }
}
