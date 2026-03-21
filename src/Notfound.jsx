import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6 text-center">
      <div>
        <h1 className="text-7xl font-extrabold bg-linear-to-r from-blue-500 to-blue-700 text-transparent bg-clip-text">
          404
        </h1>
        <h2 className="mt-3 text-2xl font-semibold text-gray-800">
          Page Not Found
        </h2>
        <p className="mt-2 text-gray-500 text-sm">
          The page you’re looking for doesn’t exist.
        </p>
        <Link
          to="/"
          className="inline-block mt-5 px-5 py-2.5 rounded-lg text-white bg-linear-to-r from-blue-500 to-blue-700 shadow hover:shadow-md transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
