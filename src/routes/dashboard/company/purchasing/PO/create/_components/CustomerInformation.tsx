import { useRouteLoaderData } from "@remix-run/react";
import { Input } from "~/components/ui/input";
import type { loader as createPoLoaderType } from "../_dashboard.$companyId.purchasing.PO_.create.route";
import { CompanyIdLoader } from "~/routes/dashboard/company/_dashboard.$companyId.route";

type Props = {
  loaderData: Awaited<ReturnType<typeof createPoLoaderType>>;
};

export const CustomerInformation = ({ loaderData }: Props) => {
  const companyLoaderData = useRouteLoaderData<CompanyIdLoader>(
    "_dashboard.$companyId"
  );

  return (
    <div className="border border-gray-300">
      <div className="bg-blue-900 text-white px-4 py-2">
        <h3 className="font-semibold text-sm">CUSTOMER INFORMATION</h3>
      </div>
      <div className="grid grid-cols-2 border-b border-gray-300">
        <div className="p-3 border-r border-gray-300">
          <div className="text-xs text-gray-600 mb-1">CUSTOMER NAME</div>
          <div className="text-sm bg-white py-2 pl-2">
            {companyLoaderData?.userSelectedCompany?.name || "Loading..."}
          </div>
        </div>
        <div className="p-3">
          <div className="text-xs text-gray-600 mb-1">CONTACT PERSON</div>
          <Input
            defaultValue={
              loaderData.latestPOCustomerContact?.customerContactName
            }
            className="bg-white py-2 pl-2 rounded-none shadow-none border-none"
            required
            name="customerContactName"
            type="text"
            placeholder="Enter Contact Person"
          />
        </div>
      </div>
      <div className="p-3 border-b border-gray-300">
        <div className="text-xs text-gray-600 mb-1">ADDRESS</div>
        <div className="text-sm bg-white py-3 pl-2">
          {companyLoaderData?.userSelectedCompany?.address || "Loading..."}
        </div>
      </div>
      <div className="grid grid-cols-2">
        <div className="p-3 border-r border-gray-300">
          <div className="text-xs text-gray-600 mb-1">PHONE NUMBER</div>
          <Input
            defaultValue={
              loaderData.latestPOCustomerContact?.customerContactPhone ||
              undefined
            }
            className="bg-white py-2 pl-2 rounded-none shadow-none border-none"
            name="customerContactPhone"
            type="text"
            placeholder="Enter Phone Number"
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(
                /[^0-9+\-() ]/g,
                ""
              );
            }}
          />
        </div>
        <div className="p-3">
          <div className="text-xs text-gray-600 mb-1">EMAIL ADDRESS</div>
          <Input
            defaultValue={
              loaderData.latestPOCustomerContact?.customerContactEmail ||
              undefined
            }
            className="bg-white py-2 pl-2 rounded-none shadow-none border-none"
            name="customerContactEmail"
            type="email"
            placeholder="Enter Email Address"
          />
        </div>
      </div>
    </div>
  );
};
