import { loader } from "./route";

type Props = {
  loaderData: Awaited<ReturnType<typeof loader>>;
};

export const SupplierInformation = ({ loaderData }: Props) => {
  return (
    <div className="border border-gray-300">
      <div className="bg-blue-900 text-white px-4 py-2">
        <h3 className="font-semibold text-sm">SUPPLIER INFORMATION</h3>
      </div>
      <div className="grid grid-cols-2 border-b border-gray-300">
        <div className="p-3 border-r border-gray-300">
          <div className="text-xs text-gray-600 mb-1">SUPPLIER NAME</div>
          <div className="text-sm bg-white py-3 pl-2">
            <p>{loaderData.supplierName}</p>
          </div>
        </div>
        <div className="p-3">
          <div className="text-xs text-gray-600 mb-1">CONTACT PERSON</div>
          <div className="text-sm bg-white py-3 pl-2">
            <p>{loaderData.supplierContactName}</p>
          </div>
        </div>
      </div>
      <div className="p-3 border-b border-gray-300">
        <div className="text-xs text-gray-600 mb-1">ADDRESS</div>
        <div className="text-sm pl-2 py-3 bg-white">
          {loaderData.supplierAdress}
        </div>
      </div>
      <div className="grid grid-cols-2">
        <div className="p-3 border-r border-gray-300">
          <div className="text-xs text-gray-600 mb-1">PHONE NUMBER</div>
          <div className="text-sm py-3 pl-2 bg-white">
            {loaderData.supplierContactPhone}
          </div>
        </div>
        <div className="p-3">
          <div className="text-xs text-gray-600 mb-1">EMAIL ADDRESS</div>
          <div className="text-sm py-3 pl-2 bg-white">
            {loaderData.supplierContactEmail}
          </div>
        </div>
      </div>
    </div>
  );
};
