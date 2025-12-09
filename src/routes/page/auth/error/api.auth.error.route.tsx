import { Link } from "@remix-run/react";

export default function AuthError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Auth Error</h1>
        <p className="mb-6 text-gray-700">
          Please logout via dashboard first before change to another account.
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Go Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
