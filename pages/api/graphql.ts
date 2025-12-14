import type { NextApiRequest, NextApiResponse } from "next";
import { createSchema, createYoga } from "graphql-yoga";
import Cors from "cors";
import { verifyToken } from "./token/refresh-token";

const cors = Cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

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
    typeDefs: /* GraphQL */ `
      type Query {
        test: TestResult!
      }

      type TestResult {
        isLogined: Boolean!
        userId: ID
        role: String
      }
    `,
    resolvers: {
      Query: {
        // test 객체는 항상 반환 (로그인 여부는 필드에서 판단)
        test: (_p, _a, ctx) => ({ user: ctx.user }),
      },

      // ✅ 필드 단위 resolver로 이름을 정확히 맞춰서 제공
      TestResult: {
        isLogined: (parent) => Boolean(parent.user),

        userId: (parent) => {
          if (!parent.user) return null;
          // 너 토큰 payload에 맞게 우선순위로 뽑음
          return String(parent.user.userId ?? parent.user.sub ?? "");
        },

        role: (parent) => {
          if (!parent.user) return null;
          return String(parent.user.role ?? "user");
        },
      },
    },
  }),

  // context에서는 throw하지 말고 user만 주입
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
  await runMiddleware(req, res, cors);

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

  return yoga(req, res);
}
