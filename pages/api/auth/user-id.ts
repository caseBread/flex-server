// pages/api/auth/user-id.ts
import type { NextApiResponse } from "next";
import { applyCorsAndAuth, AuthedReq } from "../../../utils/auth";

export default async function handler(req: AuthedReq, res: NextApiResponse) {
  try {
    await applyCorsAndAuth(req, res);
  } catch {
    return;
  }

  const userId = req.user
    ? String(req.user.userId ?? req.user.sub ?? "")
    : null;
  res.status(200).json({ userId }); // 비로그인이면 null
}
