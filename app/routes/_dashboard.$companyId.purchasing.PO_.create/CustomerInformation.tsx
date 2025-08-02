import { useRouteLoaderData } from "@remix-run/react";
import React from "react";
import { CompanyIdLoader } from "../_dashboard.$companyId";
import { Input } from "~/components/ui/input";

export const CustomerInformation = () => {
  const companyLoaderData = useRouteLoaderData<CompanyIdLoader>(
    "routes/_dashboard.$companyId"
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
          <Input
            readOnly
            className="hidden"
            name="customerName"
            value={companyLoaderData?.userSelectedCompany?.name || ""}
          />
        </div>
        <div className="p-3">
          <div className="text-xs text-gray-600 mb-1">CONTACT PERSON</div>
          <Input
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
        <Input
          readOnly
          className="hidden"
          name="customerAddress"
          value={companyLoaderData?.userSelectedCompany?.address || ""}
        />
      </div>
      <div className="grid grid-cols-2">
        <div className="p-3 border-r border-gray-300">
          <div className="text-xs text-gray-600 mb-1">PHONE NUMBER</div>
          <Input
            className="bg-white py-2 pl-2 rounded-none shadow-none border-none"
            required
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
            className="bg-white py-2 pl-2 rounded-none shadow-none border-none"
            required
            name="customerContactEmail"
            type="email"
            placeholder="Enter Email Address"
          />
        </div>
      </div>
    </div>
  );
};
