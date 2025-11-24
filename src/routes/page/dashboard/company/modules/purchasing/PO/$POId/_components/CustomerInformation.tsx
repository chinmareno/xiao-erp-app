import { Input } from "~/components/ui/input";
import { type loader } from "../_dashboard.$companyId.purchasing.PO_.$POId.route";

type Props = {
  loaderData: Awaited<ReturnType<typeof loader>>;
  isEditing: boolean;
};

export const CustomerInformation = ({ loaderData, isEditing }: Props) => {
  return (
    <div className="border border-gray-300">
      <div className="bg-blue-900 text-white px-4 py-2">
        <h3 className="font-semibold text-sm">CUSTOMER INFORMATION</h3>
      </div>

      <div className="grid grid-cols-2 border-b border-gray-300">
        <div className="p-3 border-r border-gray-300">
          <div className="text-xs text-gray-600 mb-1">CUSTOMER NAME</div>
          <div className="text-sm bg-white py-3 pl-2">
            {loaderData.customerName}
          </div>
        </div>

        <div className="p-3">
          <div className="text-xs text-gray-600 mb-1">CONTACT PERSON</div>
          {isEditing && loaderData.status !== "RECEIVED" ? (
            <Input
              defaultValue={loaderData.customerContactName || ""}
              name="customerContactName"
              className="bg-white py-[22px] pl-2 w-full rounded-none shadow-none border-none"
              placeholder="Enter Contact Person"
            />
          ) : (
            <div className="text-sm bg-white py-3 pl-2">
              {loaderData.customerContactName}
            </div>
          )}
        </div>
      </div>
      <div className="p-3 border-b border-gray-300">
        <div className="text-xs text-gray-600 mb-1">ADDRESS</div>
        <div className="text-sm bg-white py-3 pl-2">
          {loaderData.customerAddress}
        </div>
      </div>

      <div className="grid grid-cols-2">
        <div className="p-3 border-r border-gray-300">
          <div className="text-xs text-gray-600 mb-1">PHONE NUMBER</div>
          {isEditing && loaderData.status !== "RECEIVED" ? (
            <Input
              defaultValue={loaderData.customerContactPhone || ""}
              name="customerContactPhone"
              type="text"
              className="bg-white py-[22px] pl-2 rounded-none shadow-none border-none"
              placeholder="Enter Phone Number"
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(
                  /[^0-9+\-() ]/g,
                  ""
                );
              }}
            />
          ) : (
            <div className="text-sm bg-white py-3 pl-2">
              {loaderData.customerContactPhone}
            </div>
          )}
        </div>

        <div className="p-3">
          <div className="text-xs text-gray-600 mb-1">EMAIL ADDRESS</div>
          {isEditing && loaderData.status !== "RECEIVED" ? (
            <Input
              defaultValue={loaderData.customerContactEmail || ""}
              name="customerContactEmail"
              type="email"
              className="bg-white py-[22px] pl-2 rounded-none shadow-none border-none"
              placeholder="Enter Email Address"
            />
          ) : (
            <div className="text-sm bg-white py-3 pl-2">
              {loaderData.customerContactEmail}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
