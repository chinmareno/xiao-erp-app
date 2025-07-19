import { useCompanyStore } from "~/hooks/useCompanyStore";

export default function DashboardIndex() {
  const { selectedCompany } = useCompanyStore();

  return (
    <section className="px-6 py-12 max-w-5xl mx-auto">
      <div className="rounded-3xl border bg-background shadow-xl p-10 sm:p-14">
        <h2 className="text-3xl font-extrabold mb-6 text-primary">
          {selectedCompany?.name}
        </h2>

        <div className="space-y-4 text-base text-muted-foreground">
          <p>
            <span className="block text-sm font-semibold text-foreground mb-1">
              Industry
            </span>
            {selectedCompany?.industry || "No industry specified"}
          </p>

          <p>
            <span className="block text-sm font-semibold text-foreground mb-1">
              Description
            </span>
            {selectedCompany?.desc || "No description provided"}
          </p>

          <p>
            <span className="block text-sm font-semibold text-foreground mb-1">
              Address
            </span>
            {selectedCompany?.address || "N/A"}
          </p>
        </div>
      </div>
    </section>
  );
}
