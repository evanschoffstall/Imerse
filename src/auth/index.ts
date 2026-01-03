import NextAuth from "next-auth";
import { authConfig } from "./config";

const handler = NextAuth(authConfig);

export { handler, authConfig };
