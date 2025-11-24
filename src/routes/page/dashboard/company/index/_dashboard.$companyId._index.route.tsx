import { ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useRouteLoaderData, useSubmit } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTrigger,
} from "~/components/ui/dialog";
import { formDataParser } from "~/lib/formDataParser";
import { z } from "zod";
import { useEffect, useState } from "react";
import { createCallerWithContext } from "~/server/api/root.server";
import { CompanyIdLoader } from "../layout/_dashboard.$companyId.route";

const InviteMemberSchema = z.object({
  companyId: z.string().min(1, "Company ID is required"),
});

type InviteMember = z.infer<typeof InviteMemberSchema>;

export async function action({ request, params }: ActionFunctionArgs) {
  const caller = await createCallerWithContext(request, params.companyId);
  const { companyId } = (await formDataParser(request)) as InviteMember;
  return await caller.company.createInviteLink({ companyId });
}

export default function DashboardIndex() {
  const companyLoaderData = useRouteLoaderData<CompanyIdLoader>(
    "_dashboard.$companyId"
  );

  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

  const [copied, setCopied] = useState(false);

  const handleInviteMember = () => {
    if (!companyLoaderData) return;

    const formData = new FormData();
    formData.append("companyId", companyLoaderData.userSelectedCompany.id);
    submit(formData, { method: "post", replace: true });
    setCopied(false);
  };

  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => {
      setCopied(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    if (!actionData) return;
    await navigator.clipboard.writeText(actionData);
    setCopied(true);
  };

  return (
    <section className="px-6 py-12 max-w-5xl mx-auto">
      <div className="rounded-3xl border bg-background shadow-xl p-10 sm:p-14">
        <h2 className="text-3xl font-extrabold mb-6 text-primary">
          {companyLoaderData?.userSelectedCompany.name}
        </h2>

        <div className="space-y-4 text-base text-muted-foreground">
          <p>
            <span className="block text-sm font-semibold text-foreground mb-1">
              Industry
            </span>
            {companyLoaderData?.userSelectedCompany.industry ||
              "No industry specified"}
          </p>

          <p>
            <span className="block text-sm font-semibold text-foreground mb-1">
              Description
            </span>
            {companyLoaderData?.userSelectedCompany.desc ||
              "No description provided"}
          </p>

          <p>
            <span className="block text-sm font-semibold text-foreground mb-1">
              Address
            </span>
            {companyLoaderData?.userSelectedCompany.address || "N/A"}
          </p>
        </div>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            onClick={handleInviteMember}
            variant="link"
            className="text-xl mt-8 font-semibold text-foreground"
          >
            Invite Member
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogDescription className="p-3 py-1">
            {actionData ? (
              <>
                <p className="text-sm ml-2  font-medium text-foreground mb-1">
                  Invite Link
                </p>
                <div
                  className={`flex w-full border  relative items-center  pl-4 py-3 rounded-lg ${
                    copied
                      ? "bg-green-100/50  border-green-500"
                      : "border-slate-400 bg-muted"
                  }`}
                >
                  <span className="truncate text-black">{actionData}</span>
                  <Button
                    size="sm"
                    onClick={handleCopy}
                    className={`px-4 ${
                      copied
                        ? "px-5 bg-green-500 hover:bg-green-600"
                        : "bg-blue-600 hover:bg-blue-700"
                    } ml-auto  absolute top-1.5 right-1.5`}
                  >
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1 ml-1">
                  Link expires in 5 minutes
                </p>
              </>
            ) : (
              <span>Generating invite link...</span>
            )}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </section>
  );
}
