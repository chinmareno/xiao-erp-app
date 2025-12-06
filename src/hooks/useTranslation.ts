import { useRouteLoaderData } from "@remix-run/react";
import { type localesLoader } from "../root";

export const useTranslation = () => {
  const t = useRouteLoaderData<localesLoader>("root");

  return t;
};
