import { Link } from "@remix-run/react";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { createCallerWithContext } from "~/.server/root.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const caller = await createCallerWithContext(request);
  const companies = await caller.company.getByUserId();

  if (companies.length >= 1) return redirect("/" + companies[0].id);

  return null;
}

export default function DashboardIndex() {
  return (
    <section className="p-6 max-w-xl mx-auto text-center">
      <div className="rounded-2xl border bg-card p-10 shadow-lg">
        <h2 className="text-2xl font-semibold mb-2 text-foreground">
          No Company Joined
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          You haven't joined any company yet. Join one to access your dashboard.
        </p>
        <Link
          to="/company/join"
          className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition"
        >
          Join a Company
        </Link>
      </div>
    </section>
  );
}
