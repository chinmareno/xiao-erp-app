import { ActionFunctionArgs } from "@remix-run/node";
import { createCallerWithContext } from "~/server/api/trpc.caller";

export async function loader({ request }: ActionFunctionArgs) {
  const caller = await createCallerWithContext(request);
  await caller.cron.deleteExpiredInviteLinks();

  return new Response(null, { status: 200 });
}
