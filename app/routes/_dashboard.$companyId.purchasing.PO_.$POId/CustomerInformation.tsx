import { loader } from "./route";

type Props = {
  loaderData: Awaited<ReturnType<typeof loader>>;
};

export const CustomerInformation = ({ loaderData }: Props) => {
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
          <div className="text-sm bg-white py-3 pl-2">
            <p>{loaderData.customerContactName}</p>
          </div>
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
          <div className="text-sm bg-white py-3 pl-2">
            <p>{loaderData.customerContactPhone}</p>
          </div>
        </div>
        <div className="p-3">
          <div className="text-xs text-gray-600 mb-1">EMAIL ADDRESS</div>
          <div className="text-sm bg-white py-3 pl-2">
            <p>{loaderData.customerContactEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
