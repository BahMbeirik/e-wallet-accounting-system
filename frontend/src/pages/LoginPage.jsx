import React, { useState, useEffect } from 'react';
import axiosInstance from '../api';
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // const [rememberMe, setRememberMe] = useState(true);
    const navigate = useNavigate();
    const [googleLoading, setGoogleLoading] = useState(false);
    const { refreshUser } = useAuth();

    const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
        // Get the Google OAuth URL from backend
        const response = await axiosInstance.get('/auth/google/url/');
        const authUrl = response.data.url;
        
        // Open the Google consent screen in a popup
        const popup = window.open(
            authUrl,
            'google-auth',
            'width=500,height=600,scrollbars=yes,resizable=yes'
        );
        
        // Check for popup block
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
            throw new Error("Popup blocked! Please allow popups for this site.");
        }
        
        // Listen for the callback
        const checkClosed = setInterval(() => {
            if (popup.closed) {
                clearInterval(checkClosed);
                setGoogleLoading(false);
                // You might want to check auth status here
                // checkAuthStatus();
            }
        }, 1000);
        
        // Listen for messages from the popup
        const messageListener = (event) => {
            if (event.origin !== window.location.origin) return;
            
            if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
                clearInterval(checkClosed);
                popup.close();
                handleAuthSuccess(event.data.code);
            } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
                clearInterval(checkClosed);
                popup.close();
                throw new Error(event.data.error || 'Authentication failed');
            }
        };
        
        window.addEventListener('message', messageListener);
        
        // Cleanup function
        setTimeout(() => {
            window.removeEventListener('message', messageListener);
            if (!popup.closed) {
                popup.close();
                setGoogleLoading(false);
            }
        }, 300000); // 5 minutes timeout
        
    } catch (error) {
        toast.error(error.message);
        setGoogleLoading(false);
    }
};

const handleAuthSuccess = async (code) => {
  try {
    // Add timestamp to ensure code is fresh
    const timestamp = Date.now();
    const response = await axiosInstance.post('/auth/google/callback/', { 
      code,
      timestamp 
    });
    
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      axiosInstance.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
      
      // Add user data to context
      await refreshUser();
      
      // Cleanup
      localStorage.removeItem('google_auth_state');
      
      navigate('/dashboard');
      toast.success("Enregistré avec succès auprès de Google!");
    } else {
      throw new Error("Réponse inattendue du serveur. Veuillez réessayer.");
    }
  } catch (error) {
    console.error('Google Auth Error:', error);
    
  }
};
    // Check if user is already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await axiosInstance.post('/auth/login/', {
                username: username,
                password: password
            });
            
            localStorage.setItem('token', response.data.token);
            
            // تحديث بيانات المستخدم في AuthContext
            await refreshUser();
            
            navigate('/dashboard', { replace: true });
            toast.success("Authentication Successful!");
        } catch (error) {
            console.log(error);
            toast.error("Incorrect Information!");
        }
    };



    return (
        <div className="min-h-screen bg-gray-50 p-2 flex justify-center items-center">
            <ToastContainer />
          <div className=' md:flex md:justify-between md:rounded-tr-lg md:w-2/3'>

            <div className='border-r-2 border-indigo-300 md:flex md:justify-center md:items-center md:flex-col  md:w-1/2 hidden'>
                <img className='w-52 h-52 flex justify-center items-center' src={require("./../images/Login.png")} alt="Login illustration" />
                <div className=" text-center ">
                    <h2 className="text-2xl font-bold text-gray-700 mt-4">Bienvenue!</h2>
                    <p className="text-gray-500 mt-2 px-8">Connectez-vous pour accéder à votre tableau de bord et gérer votre système.</p>
                </div>
            </div>

            <div className='md:w-1/2'>
                <div className="px-8 pt-6 pb-6">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Se connecter</h2>
                    <p className="text-center text-gray-500 mb-4">Veuillez entrer vos identifiants pour accéder à votre compte</p>

                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Entrez votre nom d'utilisateur"
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="mb-3">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Entrez votre mot de passe"
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-end mb-3">
                            {/*
                              <div className="flex items-center">
                                <input
                                    id="remember_me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={() => setRememberMe(!rememberMe)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>
                            */}
                            
                            <div className="text-sm ">
                                <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                                    Mot de passe oublié ?
                                </Link>
                            </div>
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            connectez-vous
                        </button>
                    </form>
                </div>
                
                <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-center">
                        <span className="text-sm text-gray-600">Vous n’avez pas de compte ?</span>
                        <Link to="/register" className="ml-1 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
                            Créez-en un maintenant
                        </Link>
                    </div>
                    
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-50 text-gray-500">Ou continuez avec</span>
                            </div>
                        </div>
                        
                        <div className='mt-2'>
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={googleLoading}
                                className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                </svg>
                                {googleLoading ? 'Connexion...' : 'Continuer avec Google'}
                            </button>
                            
                        </div>
                    </div>
                </div>
            </div>
              
          </div>
        </div>
    );
};

export default LoginPage;