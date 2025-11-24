import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useActionData, Form, useLoaderData } from "@remix-run/react";
import { auth } from "~/lib/auth/auth.server";
import { formDataParser } from "~/lib/formDataParser";
import { createCallerWithContext } from "~/server/api/root.server";
import InputWithLabel from "~/components/InputWithLabel";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { createCompanySchema } from "~/schemas/company";
import CompanyList from "../_components/CompanyList";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (session?.user.email !== "chinmareno1@gmail.com") return redirect("/");

  const caller = await createCallerWithContext(request);
  return await caller.company.getAll();
};

export async function action({ request }: ActionFunctionArgs) {
  const caller = await createCallerWithContext(request);
  const data = await formDataParser(request);

  const result = await createCompanySchema.safeParseAsync(data);

  if (result.error) {
    const errors = result.error.format();
    const formattedError = {
      name: errors.name?._errors[0],
      address: errors.address?._errors[0],
      industry: errors.industry?._errors[0],
      desc: errors.desc?._errors[0],
    };
    return { fieldErrors: formattedError };
  }

  try {
    await caller.company.create(result.data);
    return null;
  } catch (error) {
    return { error: "Failed to create company. Please try again." };
  }
}

export default function CompanyCreate() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (actionData === null) {
      formRef.current?.reset();
    }
    if (actionData?.error) {
      toast.info(actionData.error);
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
          error={actionData?.fieldErrors?.name}
        />
        <InputWithLabel
          id="address"
          label="Address"
          required
          error={actionData?.fieldErrors?.address}
        />
        <InputWithLabel
          id="industry"
          label="Industry"
          required
          error={actionData?.fieldErrors?.industry}
        />
        <InputWithLabel
          id="desc"
          label="Description"
          error={actionData?.fieldErrors?.desc}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
        >
          Create Company
        </button>
      </Form>

      <div className="mt-8">
        <CompanyList companies={loaderData} />
      </div>
    </div>
  );
}
