import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleForgotPassword = (event) => {
        event.preventDefault();
        setIsLoading(true);
        setMessage('');
        
        axiosInstance.post('/auth/password_reset/', {
            email: email
        }).then(response => {
            setIsSuccess(true);
            setMessage('A password reset link has been sent to your email.');
        }).catch(error => {
            console.log(error);
            setIsSuccess(false);
            setMessage(error.response?.data?.message || 'Error occurred. Please try again.');
        }).finally(() => {
            setIsLoading(false);
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100 to-indigo-500 rounded-full translate-y-12 -translate-x-12 opacity-40"></div>
                    
                    <div className="relative">
                        <div className="text-center mb-8">
                            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-indigo-500 to-indigo-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Mot de Passe Oublié?
                            </h2>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Pas de soucis ! Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                            </p>
                        </div>
                        
                        {message && (
                            <div className={`mb-6 p-4 rounded-xl border-l-4 ${
                                isSuccess 
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800' 
                                    : 'bg-red-50 border-red-400 text-red-800'
                            } animate-pulse`}>
                                <div className="flex items-center">
                                    <svg className={`h-5 w-5 mr-2 ${isSuccess ? 'text-emerald-400' : 'text-red-400'}`} fill="currentColor" viewBox="0 0 20 20">
                                        {isSuccess ? (
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        ) : (
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        )}
                                    </svg>
                                    <span className="text-sm font-medium">{message}</span>
                                </div>
                            </div>
                        )}
                        
                        <form onSubmit={handleForgotPassword} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Adresse e-mail
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                    <input
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-gray-50 hover:bg-white"
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Entrez votre adresse e-mail"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <button 
                                    type="submit" 
                                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Envoyer le lien de réinitialisation
                                            <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                        
                        <div className="mt-6 text-center">
                            <Link 
                                to="/login" 
                                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition duration-200 group"
                            >
                                <svg className="mr-1 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Retour à la connexion
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;