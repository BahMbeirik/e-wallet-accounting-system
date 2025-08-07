import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCurrency } from '../contexts/CurrencyContext';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { currency, setCurrency } = useCurrency();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const isStaff = user?.is_staff || false;

  // const permissions = user?.permissions || [];

  // Vérifier l'état de connexion au chargement du composant
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // Fonction pour obtenir les initiales
  const getInitials = (user) => {
    if (user?.first_name || user?.last_name) {
      return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || 'P';
  };

  // Fonction pour obtenir le nom complet
  const getDisplayName = (user) => {
    if (user?.first_name || user?.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user?.username || 'Profile';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  


  return (
    <div>
      <nav className="bg-white shadow-md"> 
      <div className="container mx-auto px-2 py-2 flex items-center justify-between">
          <div className="container mx-auto px-2 py-2 flex items-center justify-between">
            <NavLink to="/" className="inline-block">
              <h2 className="font-bold text-indigo-800 typewriter-loop  ">E-wallet Accounting System</h2>
            </NavLink>
            {/* Mobile Menu Toggle */}
              <div className="md:hidden">
              <button 
                onClick={toggleMobileMenu}
                className="text-indigo-600 focus:outline-none"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoggedIn ? (
              <>
                <NavLink to="/login" className="text-indigo-600 w-32 hover:text-indigo-800">
                  Se connecter
                </NavLink>
                <NavLink to="/register">
                  <button className="px-2 py-2 w-48 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                    Essai gratuit
                  </button>
                </NavLink>
              </>
            ) : (
              <div className="flex items-center space-x-4">

                {/* Navigation Links */}
                {!isStaff && (
                <NavLink to="/banking-apps" className="font-bold text-indigo-800">
                  Applications
                </NavLink>
                )}

                {/* Currency Selector */}
                {!isStaff && (
                  <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value)}
                    className="px-2 py-1 text-sm bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200 transition-colors"
                  >
                  <option value="USD">USD ($)</option>
                  <option value="MRU">MRU (UM)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
                )}
                
                <NavLink  to="profile" className="flex items-center space-x-3 text-gray-700 hover:text-indigo-600 transition-all duration-200 group">
                  {user?.first_name || user?.last_name ? (
                    <>
                    <div className="relative">
                      <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors duration-300">
                        <span className="font-semibold text-sm text-gray-700 group-hover:text-indigo-600">
                          {getInitials(user)}
                        </span>
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${isStaff ? 'bg-emerald-400' : 'bg-indigo-400'} rounded-full border-2 border-white`}></div>
                    </div>
                    <div className="flex flex-col w-32">
                      <span className="font-semibold text-sm leading-tight">
                        {getDisplayName(user)}
                      </span>
                      <span className="text-xs text-gray-500">Voir le profil</span>
                    </div>
                      
                    </>
                  ) : (
                    <span className="font-medium">{user?.username || 'Profile'}</span>
                  )}
                </NavLink>

                
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            
            {/* Sidebar */}
            <div className="fixed top-0 left-0 h-full overflow-scroll w-80 bg-gray-100 shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden">
              {/* Header de la sidebar */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Contenu de la sidebar */}
              <div className="p-4 space-y-2">
                {!isLoggedIn ? (
                  <>
                    <a 
                      href="/login" 
                      className="flex items-center px-4 py-3 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Se connecter
                    </a>
                    <a 
                      href="/register" 
                      className="block"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <button className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Essai gratuit
                      </button>
                    </a>
                  </>
                ) : (
                  <>
                    <ul className='nav nav-pills flex-column mb-sm-auto  mb-0' id="menu">
                            <li >
                              <NavLink className='nav-link  align-middle px-0' to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                                <span className="ms-3 text-gray-700  ">Tableau de bord</span>
                              </NavLink>
                            </li>
                            {isStaff && (
                            <li >
                              <NavLink onClick={() => setIsMobileMenuOpen(false)} className='nav-link align-middle px-0' to="/admin">
                                <span className="ms-3 text-gray-700 ">Utilisateurs</span>
                              </NavLink>
                            </li>
                            )}
                            <NavLink to="/banking-apps" onClick={() => setIsMobileMenuOpen(false)} className='nav-link align-middle px-0'>
                                <span className="ms-3 text-gray-700 ">Applications</span>
                            </NavLink>

                            {!isStaff && (
                            <li >
                              <NavLink onClick={() => setIsMobileMenuOpen(false)} className='nav-link align-middle px-0' to="/accounts">
                                <span className="ms-3 text-gray-700 ">Comptes</span>
                              </NavLink>
                            </li>
                            )}
                            {!isStaff && (
                            <li >
                              <NavLink onClick={() => setIsMobileMenuOpen(false)} className='nav-link align-middle px-0' to="/transactions">
                                <span className="ms-3 text-gray-700 ">Transactions</span>
                              </NavLink>
                            </li>
                            )} 
                            {!isStaff && (                 
                            <li >
                              <NavLink onClick={() => setIsMobileMenuOpen(false)} className='nav-link align-middle px-0' to="/journal">
                                <span className="ms-3 text-gray-700 ">Le Journal</span>
                              </NavLink>
                            </li>
                            )}
                            {!isStaff && (
                            <li >
                              <NavLink onClick={() => setIsMobileMenuOpen(false)} className='nav-link align-middle px-0' to="/grand-livre">
                                <span className="ms-3 text-gray-700 ">Grand Livre</span>
                              </NavLink>
                            </li>
                            )}
                            {!isStaff && (
                            <li >
                              <NavLink onClick={() => setIsMobileMenuOpen(false)} className='nav-link align-middle px-0' to="/transaction-reports">
                                <span className="ms-3 text-gray-700 ">Historique des transactions</span>
                              </NavLink>
                            </li>
                            )}
                            {!isStaff && (
                            <li >
                              <NavLink onClick={() => setIsMobileMenuOpen(false)} className='nav-link align-middle px-0' to="/loans-deposits">
                                <span className="ms-3 text-gray-700 ">Prêts</span>
                              </NavLink>
                            </li>
                            )}
                            {!isStaff && (  
                            <li >
                              <NavLink onClick={() => setIsMobileMenuOpen(false)} className='nav-link align-middle px-0' to="/deposits">
                                <span className="ms-3 text-gray-700 ">Dépôts</span>
                              </NavLink>
                            </li>
                            )}
                            {!isStaff && (
                            <li >
                              <NavLink onClick={() => setIsMobileMenuOpen(false)} className='nav-link align-middle px-0' to="/reports">
                                <span className="ms-3 text-gray-700 ">Rapports Financiers</span>
                              </NavLink>
                            </li>
                            )}
                            <li >
                              <NavLink onClick={() => setIsMobileMenuOpen(false)} className='nav-link align-middle px-0' to="/currency-converter">
                                <span className="ms-3 text-gray-700 ">Convertisseur</span>
                              </NavLink>
                            </li>
                            {!isStaff && (
                          
                            <li >
                              <NavLink onClick={() => setIsMobileMenuOpen(false)} className='nav-link align-middle px-0' to="/interest-calculator">
                                <span className="ms-3 text-gray-700 ">Calculateur d'intérêts</span>
                              </NavLink>
                            </li>
                            )}
                            <li >
                              <NavLink onClick={() => setIsMobileMenuOpen(false)} className='nav-link align-middle px-0' to="/profile">
                                <span className="ms-3 text-gray-700 ">Profile</span>
                              </NavLink>
                            </li>
                          </ul>
                          {/* Currency Selector for Sidebar */}
                          <div className="mb-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Devise
                            </label>
                            <select 
                              value={currency} 
                              onChange={(e) => setCurrency(e.target.value) & setIsMobileMenuOpen(false)}
                              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="USD">USD ($)</option>
                              <option value="MRU">MRU (UM)</option>
                              <option value="EUR">EUR (€)</option>
                            </select>
                          </div>

                    
                    
                          {/* Séparateur */}
                          <div className="border-t border-gray-200 my-4"></div>
                          
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center px-4 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                              </svg>
                              Déconnexion
                            </button>
                          </>
                      )}
              </div>
            </div>
          </>
        )}
      </nav>
      <ToastContainer />
    </div>
  );
};

export default Navbar;