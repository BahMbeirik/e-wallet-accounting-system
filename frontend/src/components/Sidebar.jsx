/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState ,useEffect} from 'react';
import { NavLink } from 'react-router-dom';
import { AiFillDashboard, AiOutlineTransaction } from "react-icons/ai";
import { SiConvertio, SiLivejournal } from "react-icons/si";
import {MdHistory, MdManageAccounts,MdAttachMoney, MdAppBlocking} from "react-icons/md";
import { CiCalculator2 } from "react-icons/ci";
import { HiClipboardDocumentCheck } from "react-icons/hi2";
import { FaAngleLeft, FaAngleRight, FaAngleDown, FaAngleUp } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import {CashIcon ,CreditCardIcon} from '@heroicons/react/outline';
import { GiGiftOfKnowledge } from "react-icons/gi";
import { Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';

const Sidebar = ({ onToggle }) => {
  const { user } = useAuth();
  // const permissions = user?.permissions || [];
  const [isExpanded, setIsExpanded] = useState(() => {
    // التحقق إذا كان عرض الشاشة أقل من 768px (وضع الهاتف)
    return window.innerWidth >= 768;
  });
  const { currency, setCurrency } = useCurrency();
  
  const [isTransactionsMenuOpen, setIsTransactionsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isStaff = user?.is_staff || false;

   useEffect(() => {
    const handleResize = () => {
      // إذا تم تغيير الحجم إلى وضع الهاتف، اجعل isExpanded = false
      if (window.innerWidth < 768 && isExpanded) {
        setIsExpanded(false);
      }
    };
    
    // إضافة مستمع الحدث
    window.addEventListener('resize', handleResize);
    
    // تنظيف المستمع عند إزالة المكون
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isExpanded]);

  const toggleSidebar = () => {
    // إذا كان عرض الشاشة أقل من 768px، اجعل isExpanded = false
    if (window.innerWidth < 768) {
      setIsExpanded(false);
    }
    // إذا كان عرض الشاشة أكبر من 768px، اجعل isExpanded = true
    else {
      setIsExpanded(!isExpanded);
    }
  };
  useEffect(() => {
    const token = localStorage.getItem('token');
    if(!token){
      navigate('/');
    }
    onToggle(isExpanded);
  }, [isExpanded, onToggle]);

  const toggleTransactionsMenu = () => {
    if (isExpanded) {
      setIsTransactionsMenuOpen(!isTransactionsMenuOpen);
    }
  };

  return (
    <div className='min-h-full !important bg-indigo-800 hidden md:block '>
    <div className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'} flex flex-col`}>
      <button className="toggle-btn toggle" onClick={toggleSidebar}>
        {isExpanded ? <FaAngleLeft /> : <FaAngleRight />}
      </button>
      <ul className='nav nav-pills flex-column mb-sm-auto mb-0 flex-1' id="menu">
        <li className='nav-item'>
          <NavLink className='nav-link align-middle px-0' to="/dashboard">
            <AiFillDashboard className='Icons' />
            {isExpanded && <span className="ms-3">Tableau de bord</span>}
          </NavLink>
        </li>
        {isStaff && (
        <li className='nav-item'>
          <NavLink className='nav-link align-middle px-0' to="/admin">
            <Shield className='Icons' />
            {isExpanded && <span className="ms-3">Utilisateurs</span>}
          </NavLink>
        </li>
        )}
        {isStaff && (
          <li className='nav-item'>
            <NavLink className='nav-link align-middle px-0' to="/banking-apps">
              <MdAppBlocking className='Icons' />
              {isExpanded && <span className="ms-3">Applications</span>}
            </NavLink>
          </li>
        )}
        

        {!isStaff && (
        <li className='nav-item'>
          <NavLink className='nav-link align-middle px-0' to="/accounts">
            <MdManageAccounts className='Icons' />
            {isExpanded && <span className="ms-3">Comptes</span>}
          </NavLink>
        </li>
        )}
        
        {/* Menu Transactions avec sous-menu */}
        {!isStaff && (
        <li className='nav-item'>
          <div 
            className={`nav-link align-middle px-0 ${isExpanded ? 'cursor-pointer' : ''}`}
            onClick={toggleTransactionsMenu}
            style={{ cursor: isExpanded ? 'pointer' : 'default' }}
          >
            <AiOutlineTransaction className='Icons text-white' />
            {isExpanded && (
              <>
                <b className="ms-3 text-white text-lg">Transactions</b>
                <span className="ms-auto">
                  {isTransactionsMenuOpen ? <FaAngleUp className='text-white'/> : <FaAngleDown className='text-white' />}
                </span>
              </>
            )}
          </div>
          
          {/* Sous-menu */}
          {isExpanded && isTransactionsMenuOpen && (
            <ul className="submenu ms-4 mt-2">
            
                <li className='nav-item'>
                  <NavLink className='nav-link align-middle px-0 py-1' to="/transactions">
                    <MdAttachMoney className='Icons'  />
                    <span className="ms-3">Transactions</span>
                  </NavLink>
                </li>
            
              <li className='nav-item'>
                <NavLink className='nav-link align-middle px-0' to="/transaction-reports">
                  <MdHistory className='Icons' />
                  {isExpanded && <span className="ms-3">Historique</span>}
                </NavLink>
              </li>
              
            </ul>
          )}
        </li>
        )}
        {!isStaff && (
        <li className='nav-item'>
          <NavLink className='nav-link align-middle px-0' to="/journal">
            <SiLivejournal className='Icons' />
            {isExpanded && <span className="ms-3">Le Journal</span>}
          </NavLink>
        </li>
        )}
        {!isStaff && (
        <li className='nav-item'>
          <NavLink className='nav-link align-middle px-0' to="/grand-livre">
            <GiGiftOfKnowledge className='Icons' />
            {isExpanded && <span className="ms-3">Grand Livre</span>}
          </NavLink>
        </li>
        )}
      
        
        {!isStaff && (
        <li className='nav-item'>
          <NavLink className='nav-link align-middle px-0' to="/loans-deposits">
            <CreditCardIcon className='w-7 h-7' />
            {isExpanded && <span className="ms-3">Prêts</span>}
          </NavLink>
        </li>
        )}
        {!isStaff && (
        <li className='nav-item'>
          <NavLink className='nav-link align-middle px-0' to="/deposits">
            <CashIcon className='w-7 h-7' />
            {isExpanded && <span className="ms-3">Dépôts</span>}
          </NavLink>
        </li>
        )}
        {!isStaff && (
        <li className='nav-item'>
          <NavLink className='nav-link align-middle px-0' to="/reports">
            <HiClipboardDocumentCheck className='Icons' />
            {isExpanded && <span className="ms-3">Rapports Financiers</span>}
          </NavLink>
        </li>
        )}

        <li className='nav-item'>
          <NavLink className='nav-link align-middle px-0' to="/currency-converter">
            <SiConvertio className='Icons' />
            {isExpanded && <span className="ms-3">Convertisseur</span>}
          </NavLink>
        </li>
        {!isStaff && (
        <li className='nav-item'>
          <NavLink className='nav-link align-middle px-0' to="/interest-calculator">
            <CiCalculator2 className='Icons' />
            {isExpanded && <span className="ms-3">Calculateur d'intérêts</span>}
          </NavLink>
        </li>
        )}
        
        

        
      </ul>
      {/* Currency selector at the bottom */}
      {isStaff && (
        <div className="mt-auto">
          <hr className="border-indigo-600 my-2" />
          <div className="p-2 bg-white rounded-lg mx-2 mb-2">
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-2 py-1 text-sm text-indigo-800 rounded border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="USD">USD ($)</option>
              <option value="MRU">MRU (UM)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};
export default Sidebar;

