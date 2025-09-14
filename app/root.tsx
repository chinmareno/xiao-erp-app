import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "@remix-run/react";
import { type LinksFunction, data } from "@remix-run/node";

import "./tailwind.css";

import localeResources from "../locales/locales.server";
import { Toaster } from "./components/ui/sonner";
import NotFound from "./routes/$";

import icon from "./public/favicon.ico";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "icon",
    href: icon,
  },
];

export async function loader() {
  return data(localeResources["en"]);
}

export type localesLoader = typeof loader;
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Toaster visibleToasts={2} expand richColors />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (!isRouteErrorResponse(error))
    console.error("In Root Error Boundary : " + error);

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
    ? error.message
    : "Unknown Error";

  if (error instanceof Error && error.message === "Not Found")
    return <NotFound />;

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-100 text-gray-800">
      <title>Error - Xiao ERP</title>
      <Meta />
      <Links />

      <div className="max-w-md p-8 bg-white shadow-lg rounded-xl text-center border border-gray-200">
        <h1 className="text-2xl font-semibold mb-4 text-red-600">
          Something went wrong
        </h1>

        <p className="mb-6 text-sm text-gray-600">{message}</p>

        <Link
          to="/"
          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Back to Home
        </Link>
      </div>

      <Scripts />
    </div>
  );
}
