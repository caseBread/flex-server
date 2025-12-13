import type { NextApiRequest, NextApiResponse } from "next";
import { createSchema, createYoga } from "graphql-yoga";
import { verifyToken } from "./token/refresh-token";

export const config = {
  api: { bodyParser: false },
};

type AuthedReq = NextApiRequest & { user?: any };

const yoga = createYoga<{
  req: AuthedReq;
  res: NextApiResponse;
  user: any | null;
}>({
  graphqlEndpoint: "/api/graphql",
  schema: createSchema({
    typeDefs: `
      type Query { test: TestResult! }
      type TestResult { isLogined: Boolean! }
    `,
    resolvers: {
      Query: {
        test: (_p, _a, ctx) => ({ isLogined: Boolean(ctx.user) }),
      },
    },
  }),

  // ✅ context에서는 절대 throw하지 말고 user만 주입
  context: ({ req }) => {
    return { user: req.user ?? null };
  },
});

function extractBearer(auth?: string) {
  if (!auth) return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

export default async function handler(req: AuthedReq, res: NextApiResponse) {
  // ✅ APQ hash-only GET 처리 (그대로 유지)
  const hasQueryString =
    typeof req.query.query === "string" && req.query.query.length > 0;
  const hasApqExt =
    typeof req.query.extensions === "string" &&
    req.query.extensions.includes("persistedQuery");

  if (req.method === "GET" && !hasQueryString && hasApqExt) {
    return res.status(200).json({
      errors: [
        {
          message: "PersistedQueryNotFound",
          extensions: { code: "PERSISTED_QUERY_NOT_FOUND" },
        },
      ],
    });
  }

  // ✅ 여기서 Authorization 검사해서 401을 “확정”해버림
  const token = extractBearer(req.headers.authorization);

  if (token) {
    try {
      const decoded: any = verifyToken(token);
      if (decoded.type !== "access") {
        return res.status(401).json({ message: "invalid access token" });
      }
      req.user = decoded;
    } catch {
      return res
        .status(401)
        .json({ message: "invalid or expired access token" });
    }
  }
  // token이 없으면 미로그인: req.user 없음 → ctx.user null

  return yoga(req, res);
}
