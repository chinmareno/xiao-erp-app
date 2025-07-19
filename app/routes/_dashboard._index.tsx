import { useOutletContext, Link } from "@remix-run/react";
import type { DashboardContext } from "./_dashboard/route";

export default function DashboardIndex() {
  const outletContext = useOutletContext<DashboardContext>();

  return outletContext ? (
    <section className="px-6 py-12 max-w-5xl mx-auto">
      <div className="rounded-3xl border bg-background shadow-xl p-10 sm:p-14">
        <h2 className="text-3xl font-extrabold mb-6 text-primary">
          {outletContext.name}
        </h2>

        <div className="space-y-4 text-base text-muted-foreground">
          <p>
            <span className="block text-sm font-semibold text-foreground mb-1">
              Industry
            </span>
            {outletContext.industry || "No industry specified"}
          </p>

          <p>
            <span className="block text-sm font-semibold text-foreground mb-1">
              Description
            </span>
            {outletContext.desc || "No description provided"}
          </p>

          <p>
            <span className="block text-sm font-semibold text-foreground mb-1">
              Address
            </span>
            {outletContext.address || "N/A"}
          </p>
        </div>
      </div>
    </section>
  ) : (
    <section className="p-6 max-w-xl mx-auto text-center">
      <div className="rounded-2xl border bg-card p-10 shadow-lg">
        <h2 className="text-2xl font-semibold mb-2 text-foreground">
          No Company Joined
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          You haven’t joined any company yet. Join one to access your dashboard.
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
