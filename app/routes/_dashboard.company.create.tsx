import {
  ActionFunctionArgs,
  LoaderFunction,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useActionData, Form } from "@remix-run/react";
import { auth } from "~/lib/auth.server";
import { formDataParser } from "~/lib/formDataParser";
import { createCallerWithContext } from "~/.server/root.server";
import { z } from "zod";
import InputWithLabel from "~/components/InputWithLabel";

const createCompanySchema = z.object({
  name: z.string().min(1, "Company name cannot be empty"),
  address: z.string().optional(),
  industry: z.string().optional(),
});

type CreateCompanyForm = z.infer<typeof createCompanySchema>;

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (session?.user.email !== "chinmareno1@gmail.com") return redirect("/");
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const caller = await createCallerWithContext(request);
  const data = (await formDataParser(request)) as CreateCompanyForm;

  const result = await createCompanySchema.safeParseAsync(data);

  if (result.error) return result.error.format();

  await caller.company.create(data);

  return redirect("/");
};

export default function CompanyCreate() {
  const actionData = useActionData<typeof action>();
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Create New Company</h1>
      <Form method="post" className="space-y-4">
        <InputWithLabel
          id="name"
          label="Company Name"
          required
          error={actionData?.name?._errors[0]}
        />
        <InputWithLabel
          id="address"
          label="Address"
          error={actionData?.address?._errors[0]}
        />
        <InputWithLabel
          id="industry"
          label="Industry"
          error={actionData?.industry?._errors[0]}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
        >
          Create Company
        </button>
      </Form>
    </div>
  );
}
