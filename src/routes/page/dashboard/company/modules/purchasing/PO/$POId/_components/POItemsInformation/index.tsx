import { type loader } from "../../_dashboard.$companyId.purchasing.PO_.$POId.route";
import { POItemsInformationDetail } from "./POItemsInformationDetail";
import { Item, POItemsInformationEdit } from "./POItemsInformationEdit";
import { Params } from "@remix-run/react";

type Props = {
  loaderData: Awaited<ReturnType<typeof loader>>;
  isEditing: boolean;
  POItems: Item[];
  setPOItems: React.Dispatch<React.SetStateAction<Item[]>>;
  params: Readonly<Params<string>>;
  selectedSupplierId: string | null;
};

export const POItemsInformation = ({
  loaderData,
  isEditing,
  POItems,
  setPOItems,
  params,
  selectedSupplierId,
}: Props) => {
  return isEditing ? (
    <POItemsInformationEdit
      selectedSupplierId={selectedSupplierId}
      params={params}
      POItems={POItems}
      setPOItems={setPOItems}
    />
  ) : (
    <POItemsInformationDetail loaderData={loaderData} />
  );
};
