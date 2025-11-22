import { type FetcherWithComponents } from "@remix-run/react";
import type { loader as createPoLoaderType } from "../_dashboard.$companyId.purchasing.PO_.create.route";

type Props = {
  loaderData: Awaited<ReturnType<typeof createPoLoaderType>>;
  fetcherPOFormat: FetcherWithComponents<unknown>;
};

export const POHeader = ({ loaderData }: Props) => {
  const todayDate = new Date();

  const PONumberFormat = loaderData.POFormat;

  return (
    <div className="flex justify-between items-start mb-8">
      <div>
        <h1 className="text-4xl font-bold text-blue-900">PURCHASE ORDER</h1>
      </div>

      <div>
        <div className="border border-gray-300 min-w-[300px]">
          <div className="grid grid-cols-2">
            <div className="bg-blue-900 text-white px-4 py-2 text-xs font-semibold text-center">
              P.O. NUMBER
            </div>
            <div className="bg-blue-900 text-white px-4 py-2 text-xs font-semibold text-center">
              ISSUED DATE
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="px-4 py-2 text-center border-r border-gray-300 text-gray-900 bg-white">
              <div className="text-sm font-bold">{PONumberFormat}</div>
            </div>
            <div className="px-4 py-2 text-center bg-white">
              <div className="text-sm text-gray-700">
                {todayDate.toLocaleDateString("id-ID", {
                  timeZone: "Asia/Jakarta",
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
