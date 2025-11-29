import { ModulesType } from "~/constants/companyModules";

type CompanyData = {
  name: string;
  address: string;
  industry: string;
  desc: string | null;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  modules: ModulesType[];
};

type CompanyListItemProps = {
  company: CompanyData;
};

const CompanyListItem = ({ company }: CompanyListItemProps) => {
  return (
    <li key={company.id} className="border p-2 rounded">
      <div className="font-bold">{company.name}</div>
      {company.address && (
        <div className="text-sm text-gray-600">{company.address}</div>
      )}
      {company.industry && (
        <div className="text-sm text-gray-600 italic">{company.industry}</div>
      )}
      <div className="text-xs text-blue-500 mt-1">
        Modules: {company.modules.length}
      </div>
      <p>ss</p>
    </li>
  );
};

type CompanyListProps = {
  companies: CompanyData[];
};

export const CompanyList = ({ companies }: CompanyListProps) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Existing Companies</h2>
      {companies.length === 0 ? (
        <p>No companies found.</p>
      ) : (
        <ul className="space-y-2">
          {companies.map((company) => (
            <CompanyListItem key={company.id} company={company} />
          ))}
        </ul>
      )}
    </div>
  );
};
