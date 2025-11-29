import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "~/server/api/routers";
import { createTRPCContext } from "~/server/api/trpc";

export async function loader(args: LoaderFunctionArgs) {
  const companyId = args.request.headers.get("x-company-id");
  return handleRequest(args, companyId !== null ? companyId : undefined);
}

export async function action(args: ActionFunctionArgs) {
  const companyId = args.request.headers.get("x-company-id");
  return handleRequest(args, companyId !== null ? companyId : undefined);
}

const handleRequest = (
  args: LoaderFunctionArgs | ActionFunctionArgs,
  companyId?: string
) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: args.request,
    router: appRouter,
    createContext: () => createTRPCContext(args.request, companyId),
  });
};
