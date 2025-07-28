/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import axiosInstance from '../api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);
    
    const calculatePasswordStrength = (pwd) => {
        let strength = 0;
        if (pwd.length >= 8) strength += 1;
        if (/[A-Z]/.test(pwd)) strength += 1;
        if (/[0-9]/.test(pwd)) strength += 1;
        if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
        setPasswordStrength(strength);
    };
    
    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        calculatePasswordStrength(newPassword);
    };
    
    const handleRegister = (event) => {
        event.preventDefault();
        axiosInstance.post('/auth/register/', {
            username: username,
            password: password,
            email: email
        }).then(response => {
            window.location.href = '/login';
            toast.success("Sign Up Successfully!");
        }).catch(error => {
            console.log(error);
            toast.error("Incorrect Information!");
        });
    };

    return (
      <div className="min-h-screen bg-gray-50 p-2 flex justify-center items-center">
            <div className=' md:flex md:justify-between md:rounded-tl-lg md:w-2/3'>
                <div className="md:w-1/2">
                    <div className="px-8 pt-3 pb-3">
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Créer un compte</h2>
                        <p className="text-center text-gray-600 mb-3">Rejoignez-nous aujourd’hui et accédez à toutes les fonctionnalités</p>
                        
                        <form onSubmit={handleRegister}>
                            <div className="mb-2">
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Nom d'utilisateur</label>
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
                                        placeholder="Choisissez un nom d'utilisateur"
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="mb-2">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Adresse e-mail</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="vous@example.com"
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="mb-2">
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
                                        onChange={handlePasswordChange}
                                        placeholder="Créez un mot de passe fort"
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        required
                                    />
                                </div>
                                
                                {/* Password strength indicator */}
                                {password.length > 0 && (
                                    <div className="mt-2">
                                        <div className="flex items-center mb-1">
                                            <span className="text-xs text-gray-600">Force du mot de passe :</span>
                                            <span className="ml-1 text-xs font-medium">
                                                {passwordStrength === 0 && "Très faible"}
                                                {passwordStrength === 1 && "Faible"}
                                                {passwordStrength === 2 && "Moyenne"}
                                                {passwordStrength === 3 && "Forte"}
                                                {passwordStrength === 4 && "Très forte"}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div 
                                                className={`h-1.5 rounded-full ${
                                                    passwordStrength === 0 ? "bg-red-500 w-1/5" : 
                                                    passwordStrength === 1 ? "bg-orange-500 w-2/5" : 
                                                    passwordStrength === 2 ? "bg-yellow-500 w-3/5" : 
                                                    passwordStrength === 3 ? "bg-blue-500 w-4/5" : 
                                                    "bg-green-500 w-full"
                                                }`}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* 
                            <div className="mb-2">
                                <div className="flex items-center">
                                    <input
                                        id="terms"
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        required
                                    />
                                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                                        I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                                    </label>
                                </div>
                            </div>
                            */}
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                            >
                                S'inscrire
                            </button>
                        </form>
                    </div>
                    
                    <div className="px-8 py-2 bg-gray-50 border-t border-gray-100 ">
                        <div className="flex items-center justify-center">
                            <span className="text-sm text-gray-600">Vous avez déjà un compte ?</span>
                            <Link to="/login" className="ml-1 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
                                Connectez-vous à la place
                            </Link>
                        </div>
                        
                        
                    </div>
                </div>


                <div className='border-l-2 border-gray-300 md:flex md:justify-center md:items-center md:flex-col  md:w-1/2 hidden'>
                  <img className='w-52 h-52' src={require("./../images/Fingerprint-bro.png")} alt="Signup illustration" />
                  <div className="text-center px-8 mt-4">
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">Rejoindre notre communauté</h2>
                      <p className="text-gray-600 mb-4">Créez votre compte pour débloquer toutes les fonctionnalités exclusives</p>
                      <ul className="space-y-2 text-gray-600 text-sm">
                          <li className="flex items-center justify-center">
                              <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Accès à du contenu premium 
                          </li>
                          <li className="flex items-center justify-center">
                              <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              tableau de bord personnalisé
                          </li>
                          <li className="flex items-center justify-center">
                              <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Support client 24/7
                          </li>
                      </ul>
                  </div>
              </div>
            </div>
        </div>
    );
};

export default RegisterPage;