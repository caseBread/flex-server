import type { NextApiResponse } from "next";
import { applyCorsAndAuth, AuthedReq } from "../_utils/auth";

export default async function handler(req: AuthedReq, res: NextApiResponse) {
  try {
    await applyCorsAndAuth(req, res);
  } catch {
    return;
  }

  const role = req.user ? String(req.user.role ?? "user") : null;
  res.status(200).json({ role }); // 비로그인이면 null
}
