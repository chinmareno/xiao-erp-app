import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "~/server/api/routers";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();
