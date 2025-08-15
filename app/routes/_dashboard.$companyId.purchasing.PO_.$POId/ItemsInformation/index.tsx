import { loader } from "../route";
import { ItemsInformationDetail } from "./ItemsInformationDetail";
import { Item, ItemsInformationEdit } from "./ItemsInformationEdit";
import { Params } from "@remix-run/react";

type Props = {
  loaderData: Awaited<ReturnType<typeof loader>>;
  isEditing: boolean;
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  params: Readonly<Params<string>>;
  selectedSupplierId: string | null;
};

export const ItemsInformation = ({
  loaderData,
  isEditing,
  items,
  setItems,
  params,
  selectedSupplierId,
}: Props) => {
  return isEditing ? (
    <ItemsInformationEdit
      selectedSupplierId={selectedSupplierId}
      params={params}
      items={items}
      setItems={setItems}
    />
  ) : (
    <ItemsInformationDetail loaderData={loaderData} />
  );
};
