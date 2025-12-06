import { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData, useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { createCallerWithContext } from "~/server/api/trpc.caller";
import { useCompanyMemberStore } from "~/hooks/stores/useCompanyMemberStore";
import { useCompanyStore } from "~/hooks/stores/useCompanyStore";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "~/server/api/routers";
import { TRPCProvider } from "~/lib/trpc/trpc";
import { useQueryClient } from "@tanstack/react-query";

export type CompanyIdLoader = typeof loader;

export async function loader({ request, params }: LoaderFunctionArgs) {
  const companyId = params.companyId as string;
  if (companyId === "favicon.ico") {
    throw new Response("Not Found", { status: 404 });
  }

  const caller = await createCallerWithContext(request, companyId);

  const company = await caller.company.getByCompanyId();
  const companyMember = await caller.companyMember.getByCompanyId();

  if (!company || !companyMember) {
    throw new Error("Not Found");
  }

  return { company, companyMember };
}
export default function DashboardCompanyIdLayout() {
  const loaderData = useLoaderData<typeof loader>();

  const { setSelectedCompany } = useCompanyStore();
  const { setCompanyMember } = useCompanyMemberStore();

  const params = useParams();
  const companyId = params.companyId as string;

  const queryClient = useQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          headers() {
            return { "X-Company-Id": companyId };
          },
          transformer: superjson,
        }),
      ],
    })
  );
  useEffect(() => {
    setCompanyMember(loaderData.companyMember);
    setSelectedCompany(loaderData.company);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaderData]);

  return (
    <TRPCProvider
      keyPrefix={companyId}
      trpcClient={trpcClient}
      queryClient={queryClient}
    >
      <Outlet />
    </TRPCProvider>
  );
}
