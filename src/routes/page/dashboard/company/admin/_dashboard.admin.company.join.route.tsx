import { Form, useActionData } from "@remix-run/react";
import InputWithLabel from "~/components/InputWithLabel";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { z } from "zod";
import { formDataParser } from "~/lib/formDataParser";
import { createCallerWithContext } from "~/server/api/trpc.caller";
import { TRPCError } from "@trpc/server";

const joinSchema = z.object({
  companyId: z.string().min(1, "Company ID is required"),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const data = (await formDataParser(request)) as z.infer<typeof joinSchema>;
  const result = await joinSchema.safeParseAsync(data);
  if (!result.success)
    return { error: result.error.format().companyId?._errors[0] };

  const caller = await createCallerWithContext(request);
  const companyId = result.data?.companyId;

  try {
    await caller.companyMember.joinByCompanyId({ companyId });
  } catch (error) {
    if (error instanceof TRPCError) {
      if (error.code === "NOT_FOUND") {
        return { error: error.message };
      }
      if (error.code === "CONFLICT") {
        return { error: error.message };
      }
    } else {
      throw error;
    }
  }

  return redirect("/" + companyId);
};

export default function JoinCompanyForm() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Join Company</h1>
      <Form method="post" className="space-y-4">
        <InputWithLabel
          id="companyId"
          label="Company ID"
          error={actionData?.error}
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700"
        >
          Request to Join
        </button>
      </Form>
    </div>
  );
}
