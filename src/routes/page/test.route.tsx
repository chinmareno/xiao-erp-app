import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc/trpc";

export async function loader({ request }: LoaderFunctionArgs) {
  return { aa: "loaderrss" };
}

const test = () => {
  const dataLoader = useLoaderData<typeof loader>();
  const trpc = useTRPC();
  const { data } = useQuery(
    trpc.test.checkaja.queryOptions(undefined, { initialData: dataLoader })
  );

  const s = useQueryClient();
  return (
    <div>
      <p>{data.aa}</p>
      <p>ss</p>
      <button
        onClick={() => {
          s.invalidateQueries(trpc.test.checkaja.queryFilter());
          console.log({ ss: data });
        }}
      >
        revalidate
      </button>
    </div>
  );
};

export default test;
