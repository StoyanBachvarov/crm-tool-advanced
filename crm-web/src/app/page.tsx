import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          Welcome to the <span className="text-blue-600">Advanced CRM Tool</span>
        </h1>
        <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
          A comprehensive software product for sales teams to plan, organize, execute, and track their daily work with customers.
        </p>
        <p className="mt-4 text-md text-gray-500 max-w-2xl mx-auto">
          Manage customers, opportunities, offers, and access real-time insights, whether you are at your desk or in the field.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/login" 
            className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg transition-colors"
          >
            Login
          </Link>
          <Link 
            href="/register" 
            className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

