import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export default function POST(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "token is required" });
  }

  try {
    const decoded: any = verifyToken(token);

    // refresh token만 허용
    if (decoded.type !== "refresh") {
      return res.status(401).json({ message: "invalid refresh token" });
    }

    return res.status(200).json({
      accessToken: signAccessToken(),
      refreshToken: signRefreshToken(),
    });
  } catch {
    return res.status(401).json({ message: "invalid or expired token" });
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export function signAccessToken() {
  return jwt.sign({ sub: "test-user", type: "access" }, JWT_SECRET, {
    expiresIn: "10m",
  });
}

export function signRefreshToken() {
  return jwt.sign({ sub: "test-user", type: "refresh" }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}
