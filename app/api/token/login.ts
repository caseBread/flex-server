import type { NextApiRequest, NextApiResponse } from "next";
import { signAccessToken } from "./refresh-token";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    accessToken: signAccessToken(), // 10분
    refreshToken: signRefreshToken(), // 7일
  });
}
