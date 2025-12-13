import type { NextApiRequest, NextApiResponse } from "next";
import { signAccessToken, signRefreshToken } from "./refresh-token";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  return res.status(200).json({
    accessToken: signAccessToken(), // 10분
    refreshToken: signRefreshToken(), // 7일
  });
}
