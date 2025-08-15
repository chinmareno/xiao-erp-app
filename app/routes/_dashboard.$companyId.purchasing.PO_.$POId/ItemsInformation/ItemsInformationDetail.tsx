import { thousandSeparatorFormatter } from "~/lib/thousandSeparatorFormatter";
import { loader } from "../route";

type Props = {
  loaderData: Awaited<ReturnType<typeof loader>>;
};

export const ItemsInformationDetail = ({ loaderData }: Props) => {
  const itemTotalParser = (itemPrice: number, itemQuantity: number) => {
    const isIDR = loaderData.priceCurrency === "IDR";

    const total = isIDR
      ? thousandSeparatorFormatter(String(itemPrice * itemQuantity))
      : String(itemPrice * itemQuantity);

    return total;
  };

  return (
    <div>
      <div className="bg-blue-900 text-white p-3 font-semibold">ITEMS</div>

      <div className="border border-blue-200 bg-white">
        <div className="grid  items-center grid-cols-12 gap-2 p-3 bg-blue-100 border-b border-blue-200 font-semibold text-sm">
          <div className="col-span-1 ">No.</div>

          <div className="col-span-2">Name</div>

          <div className="col-span-2">Quantity</div>

          <div className="col-span-2">Unit</div>

          <div className="col-span-2">
            <p>price</p>
          </div>

          <div className="col-span-2 text-right mr-3 self-center">
            total price
          </div>
        </div>
      </div>

      <div className="border">
        {loaderData.items.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-12 gap-2 p-3 text-sm border-b border-blue-800"
          >
            <div className="col-span-1 self-center">{`${index + 1})`}</div>

            <div className="col-span-2">
              <p>{item.item.name}</p>
            </div>

            <div className="col-span-2">
              <p>{thousandSeparatorFormatter(String(item.quantity))}</p>
            </div>

            <div className="col-span-2">
              <p>{item.unit}</p>
            </div>
            <div className="col-span-2">
              <p>
                {loaderData.priceCurrency === "IDR"
                  ? thousandSeparatorFormatter(String(item.costIdr))
                  : item.costYuan}
              </p>
            </div>
            <div className="col-span-2 mr-3 text-right self-center">
              <p>
                {" "}
                {loaderData.priceCurrency === "IDR"
                  ? itemTotalParser(item.costIdr, item.quantity)
                  : itemTotalParser(item.costYuan, item.quantity)}
              </p>
            </div>
          </div>
        ))}

        <div className="flex mt-5">
          <div className="ml-auto mr-3 flex flex-col text-right divide-y-2 items-center">
            <p className="font-semibold items-center w-full grid-cols-4 grid text-lg">
              <span className="col-span-1 text-left">
                Subtotal {loaderData.priceCurrency === "IDR" ? "(IDR)" : "(¥)"}
              </span>
              <span className="col-span-3 pr-1 ml-auto my-2">
                {loaderData.subTotal}
              </span>
            </p>

            <p className="grid-cols-4 grid items-center w-full gap-9 text-lg">
              <span className="col-span-1 text-left my-2"> Discount (%)</span>
              <span className="col-span-1 text-left my-2">
                {loaderData.discount}
              </span>

              <span className="col-span-2">{loaderData.discountTotal}</span>
            </p>

            <p className="ml-auto w-full items-center text-lg gap-9 grid-cols-4 grid">
              <span className="col-span-1 text-left my-2"> Tax (%)</span>
              <span className="col-span-1 text-left my-2">
                {loaderData.tax}
              </span>
              <span className="col-span-2 "> {loaderData.taxTotal}</span>
            </p>
            <p className="ml-auto w-full items-center grid-cols-3 grid font-semibold text-lg">
              <span className="col-span-1 text-left my-2">Total Amount</span>
              <span className="col-span-2 pr-1 ml-auto">
                {loaderData.grandTotal}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
