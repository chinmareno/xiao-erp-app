import { Link } from "@remix-run/react";

export default function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="text-center px-6 py-10 bg-white shadow-md rounded-2xl">
        <h1 className="text-6xl font-bold text-red-500">404</h1>
        <p className="mt-4 text-xl text-gray-700">Page Not Found</p>
        <p className="mt-2 text-gray-500">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
