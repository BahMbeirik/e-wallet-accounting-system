from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AccountViewSet, BankingAppViewSet, ChangePasswordView, CleanupSocialTokens, CurrentUserView, GoogleCallback, GoogleLoginUrl, ReceiveExternalData, TransactionViewSet, LoanViewSet, DepositViewSet,
    RegisterView, LoginView, UpdateProfileView, UserStatusView, ValidateResetTokenView, import_accounts_csv, import_transactions_csv, transaction_report, financial_report,
    calculate_loan_interest, calculate_deposit_interest, convert_currency,
    dashboard_data, JournalEntryListCreate, JournalEntryDetail, import_csv,
    GrandLivreAPIView, GrandLivreAllAccountsAPIView,GroupViewSet, PermissionViewSet, UserViewSet,ContactRequestCreateView
)

router = DefaultRouter()
router.register(r'accounts', AccountViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'loans', LoanViewSet)
router.register(r'deposits', DepositViewSet)

router.register(r'groups', GroupViewSet)
router.register(r'permissions', PermissionViewSet)
router.register(r'users', UserViewSet)

router.register(r'banking-apps', BankingAppViewSet, basename='bankingapp')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('transaction-report/', transaction_report, name='transaction_report'),
    path('financial-report/', financial_report, name='financial_report'),
    path('loans/<int:loan_id>/calculate_interest/', calculate_loan_interest, name='calculate_interest'),
    path('deposits/<int:deposit_id>/calculate_interestDeposit/', calculate_deposit_interest, name='calculate_interestDeposit'),
    path('convert/<str:from_currency>/<str:to_currency>/<str:amount>/', convert_currency, name='convert_currency'),
    path('dashboard-data/', dashboard_data, name='dashboard_data'),
    path('journal-entries/', JournalEntryListCreate.as_view(), name='journal-entry-list-create'),
    path('journal-entries/<int:pk>/', JournalEntryDetail.as_view(), name='journal-entry-detail'),
    path('import-csv/', import_csv, name='import_csv'),
    path('import_transactions_csv/', import_transactions_csv, name='import_transactions_csv'),
    path('import-accounts-csv/', import_accounts_csv, name='import_accounts_csv'),
    path('grand-livre/<int:account_id>/', GrandLivreAPIView.as_view(), name='grand-livre'),
    path('grand-livre/all/', GrandLivreAllAccountsAPIView.as_view(), name='grand-livre-all'),
    path('contact-sales/', ContactRequestCreateView.as_view(), name='contact-sales'),
    path('auth/google/url/', GoogleLoginUrl.as_view(), name='google_login_url'),
    path('auth/google/callback/', GoogleCallback.as_view(), name='google_callback'),
    path('auth/user/', UserStatusView.as_view(), name='user_status'),
    path('auth/cleanup-tokens/', CleanupSocialTokens.as_view(), name='cleanup_tokens'),

    path('external/<str:app_name>/', ReceiveExternalData.as_view(), name='receive_external_data'),

    path('me/', CurrentUserView.as_view(), name='current-user'),

    path('auth/me/', CurrentUserView.as_view(), name='current-user'),
    path('auth/update-profile/', UpdateProfileView.as_view(), name='update-profile'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),

    path('auth/password_reset/validate/', ValidateResetTokenView.as_view(), name='password_reset_validate'),
]