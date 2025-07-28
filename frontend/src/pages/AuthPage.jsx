import React, { useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AuthPage = () => {
  const location = useLocation();
  const [activeButton, setActiveButton] = useState(location.pathname);

  const handleButtonClick = (path) => {
    setActiveButton(path);
  };

  return (
    <div className=" bg-gradient-to-br from-indigo-100 to-purple-100 flex  justify-center p-2">
      <ToastContainer />
      
      <div className="w-full h-50 bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Top decorative element */}
        <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600"></div>
        
        <div className="p-2">
          {/* Logo/Brand Area */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Welcome</h1>
            <p className="text-gray-500 mt-2">Please login or create an account</p>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex mb-6">
            <Link
              to="/login"
              className={`flex-1 py-3 text-center font-medium transition-all duration-200 ease-in-out border-b-2 ${
                activeButton === '/login' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              role="button"
              onClick={() => handleButtonClick('/login')}
            >
              Login
            </Link>
            
            <Link
              to="/register"
              className={`flex-1 py-3 text-center font-medium transition-all duration-200 ease-in-out border-b-2 ${
                activeButton === '/register' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              role="button"
              onClick={() => handleButtonClick('/register')}
            >
              Register
            </Link>
          </div>
          
          
        </div>
      </div>
    </div>
  );
};

export default AuthPage;