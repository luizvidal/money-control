import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-b from-white to-blue-50">
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute right-0 top-0 transform translate-x-1/2 -translate-y-1/4 lg:translate-x-1/4 xl:-translate-y-1/2 text-blue-50" width="404" height="784" fill="none" viewBox="0 0 404 784">
          <defs>
            <pattern id="pattern-squares" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="4" height="4" className="text-blue-100" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="404" height="784" fill="url(#pattern-squares)" />
        </svg>
        <svg className="absolute left-full transform -translate-x-1/2 -translate-y-1/4 lg:-translate-x-3/4 xl:-translate-y-1/2 text-blue-50" width="404" height="784" fill="none" viewBox="0 0 404 784">
          <defs>
            <pattern id="pattern-squares-2" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="4" height="4" className="text-blue-100" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="404" height="784" fill="url(#pattern-squares-2)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 relative">
        <div className="px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Take control of your <span className="text-blue-600 inline-block relative">finances
              <span className="absolute bottom-0 left-0 w-full h-2 bg-blue-200 opacity-50 rounded"></span>
            </span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl leading-relaxed">
            Money Control helps you track your income and expenses, set financial goals, and make better financial decisions.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Get started for free
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
