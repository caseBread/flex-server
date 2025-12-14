import type { NextApiResponse } from "next";
import { applyCorsAndAuth, AuthedReq } from "../_utils/auth";

export default async function handler(req: AuthedReq, res: NextApiResponse) {
  try {
    await applyCorsAndAuth(req, res);
  } catch {
    return; // 이미 응답 보냈음(401 등)
  }

  res.status(200).json({ isLogined: Boolean(req.user) });
}
