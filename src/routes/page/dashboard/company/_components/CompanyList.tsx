import { ModulesType } from "~/constants/companyModules";

type Props = {
  companies: {
    name: string;
    address: string;
    industry: string;
    desc: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    modules: ModulesType[];
  }[];
};

const CompanyList = ({ companies }: Props) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Existing Companies</h2>
      {companies.length === 0 ? (
        <p>No companies found.</p>
      ) : (
        <ul className="space-y-2">
          {companies.map((company) => (
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
  );
};

export default CompanyList;
