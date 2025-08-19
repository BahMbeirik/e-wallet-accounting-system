// App.js
import {useState} from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AccountsPage from './pages/AccountsPage';
import TransactionsPage from './pages/TransactionsPage';
import NewAccountForm from './pages/NewAccountForm';
import FinancialReport from './pages/ReportsPage';
import TransactionReport from './pages/TransactionReport'
import CurrencyConverter from './components/CurrencyConverter';
import LoansDepositsPage from './pages/LoansDepositsPage';
import InterestCalculator from './components/InterestCalculator';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard'
import AuthPage from './pages/AuthPage'
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import JournalEntryList from './pages/Journal';
import AddJournalEntry from './pages/addJournal'
import BankingLandingPage from './components/Welcome';
import AccountDetailPage from './pages/AccountDetailPage';
import EditAccountPage from './pages/EditAccountPage';
import ViewJournalEntry from './pages/ViewJournalEntry';
import EditJournalEntry from './pages/EditJournalEntry';  
import DepositsPage from './pages/DepositsPage';
import GrandLivreAll from './pages/GrandLivreAll';
import GrandLivre from './pages/GrandLivre';
import GoogleCallback from './components/GoogleCallback';
import ProtectedRoute from './components/ProtectedRoute';
// import Administration from './pages/Administration';
import UserManagement from './components/admin/UserManagement';
import Profile from './pages/Profile';
import DocumentationPage from './pages/DocumentationPage';
import BankingAppList from './pages/BankingAppList';  
import ContactPage from './pages/contactPage';

function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const handleSidebarToggle = (expanded) => {
    setIsSidebarExpanded(expanded);
  };

  return (
    <Router>
      <div>
        <Routes>
          {/* صفحات بدون sidebar و navbar */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path='/auth' element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password-confirm" element={<ResetPassword />} />
          <Route path="/" element={<BankingLandingPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/documentation" element={<DocumentationPage />} />
          <Route path="/contact-sales" element={<ContactPage />} />
          {/* صفحات مع sidebar و navbar */}
          <Route
            path="/*"
            element={
              <div className="flex w-full pl-0.5 h-screen overflow-hidden">
                <div className={`
                  h-screen
                  transition-all
                  duration-300
                  ease-in-out
                  z-40
                  ${isSidebarExpanded ? 'w-30' : 'w-13'}
                  bg-white
                  shadow-md
                  flex-shrink-0
                  md:overflow-y-auto
                `}>
                  <Sidebar onToggle={handleSidebarToggle} />
                </div>
                {/* Main Content Area */}
                <div className="flex flex-col flex-1 h-screen">
                  {/* Navbar*/}
                  <div className="sticky top-0 z-30 bg-white shadow-sm">
                    <Navbar />
                  </div>

                  {/* Content Wrapper*/}
                  <main className="p-1 md:p-1 lg:p-1 flex-1 bg-gray-50 overflow-y-auto">
                    <Routes >
                      <Route path="/dashboard" element={<Dashboard isSidebarExpanded={isSidebarExpanded}/>} />
                      <Route path="/accounts" element={<AccountsPage />} />
                      <Route path="/transactions" element={
                        <TransactionsPage />
                      } />
                      <Route path="/new-account" element={<NewAccountForm />} />
                      <Route path="/reports" element={<FinancialReport />} />
                      <Route path="/transaction-reports" element={<TransactionReport />} />
                      <Route path="/currency-converter" element={<CurrencyConverter />} />
                      <Route path="/loans-deposits" element={<LoansDepositsPage isSidebarMinimized={isSidebarExpanded.isMinimized} />} />
                      <Route path="/interest-calculator" element={<InterestCalculator />} />
                      <Route path="/journal" element={<JournalEntryList />} />
                      <Route path="/add-journal" element={<AddJournalEntry />} />
                      <Route path="/account/:id" element={<AccountDetailPage />} />
                      <Route path="/edit-account/:id" element={<EditAccountPage />} />
                      <Route path="/view-journal/:id" element={<ViewJournalEntry />} />
                      <Route path="/edit-journal/:id" element={<EditJournalEntry />} />
                      <Route path="/deposits" element={<DepositsPage />} />
                      <Route path="/grand-livre" element={<GrandLivreAll />} />
                      <Route path="/grand-livre/:id" element={<GrandLivre />} />
                      <Route
                          path="/admin" 
                          element={
                            <ProtectedRoute requiredPermissions={['auth.change_user']}>
                              <UserManagement />
                            </ProtectedRoute>
                          } 
                        />
                        <Route
                          path="/profile" 
                          element={
                            <Profile />
                          }
                        />
                      <Route
                        path="/banking-apps"
                        element={
                          <BankingAppList />
                        }
                      />
                    </Routes>
                  </main>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
