import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useActionData, Form, useLoaderData } from "@remix-run/react";
import { auth } from "~/lib/auth/auth.server";
import { formDataParser } from "~/lib/formDataParser";
import { createCallerWithContext } from "~/.server/root.server";
import { z } from "zod";
import InputWithLabel from "~/components/InputWithLabel";
import { useEffect, useRef } from "react";

const createCompanySchema = z.object({
  name: z.string().min(1, "Company name cannot be empty"),
  address: z.string().optional(),
  industry: z.string().optional(),
  desc: z.string().optional(),
});

type CreateCompanyForm = z.infer<typeof createCompanySchema>;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (session?.user.email !== "chinmareno1@gmail.com") return redirect("/");

  const caller = await createCallerWithContext(request);
  return await caller.company.getAll();
};

export async function action({ request }: ActionFunctionArgs) {
  const caller = await createCallerWithContext(request);
  const data = (await formDataParser(request)) as CreateCompanyForm;

  const result = await createCompanySchema.safeParseAsync(data);

  if (result.error) return result.error.format();

  await caller.company.create(data);
  return null;
}

export default function CompanyCreate() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (actionData === null) {
      formRef.current?.reset();
    }
  }, [actionData, loaderData]);

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Create New Company</h1>
      <Form method="post" className="space-y-4" ref={formRef}>
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
        <InputWithLabel
          id="desc"
          label="Description"
          error={actionData?.desc?._errors[0]}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
        >
          Create Company
        </button>
      </Form>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Existing Companies</h2>
        {loaderData.length === 0 ? (
          <p>No companies found.</p>
        ) : (
          <ul className="space-y-2">
            {loaderData.map((company) => (
              <li key={company.id} className="border p-2 rounded">
                <div className="font-bold"> {company.id}</div>
                <div className="font-medium">{company.name}</div>
                {company.address && (
                  <div className="text-sm text-gray-600">{company.address}</div>
                )}
                {company.industry && (
                  <div className="text-sm text-gray-600 italic">
                    {company.industry}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
