import csv
from decimal import Decimal, DecimalException, InvalidOperation
import io
from django.http import JsonResponse
from collections import defaultdict
from rest_framework import viewsets
from rest_framework.response import Response
from .models import Account, Deposit, Loan, Transaction, JournalEntry
from .serializers import AccountSerializer, ChangePasswordSerializer, DepositSerializer, ExternalAccountSerializer, ExternalTransactionSerializer, LoanSerializer, TransactionSerializer ,JournalEntrySerializer,LoginSerializer, RegisterSerializer, UserProfileSerializer
import requests 
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from django.db.models import Count, Sum  ,DecimalField
from django.db.models.functions import Coalesce
from datetime import datetime
from django.utils import timezone
from rest_framework import generics
import csv
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from io import TextIOWrapper
from collections import OrderedDict
from dateutil import parser
from rest_framework import permissions
from django.conf import settings
from urllib.parse import urlencode
from django.core.exceptions import ValidationError
from .models import BankingApp
from .serializers import BankingAppSerializer
import requests
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth import update_session_auth_hash
from .serializers import GroupSerializer, PermissionSerializer, UserSerializer
User = get_user_model()
from django_rest_passwordreset.models import ResetPasswordToken
# Create your views here.

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(username=username, password=password)
            if user is not None:
                token, created = Token.objects.get_or_create(user=user)
                return Response({'token': token.key}, status=status.HTTP_200_OK)
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Optionally create and return token here too
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'status': 'User created',
                'token': token.key
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GoogleLoginUrl(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        try:
            # Get Google OAuth configuration
            google_config = settings.SOCIALACCOUNT_PROVIDERS['google']
            client_id = google_config['APP']['client_id']
            callback_url = "http://localhost:3000/auth/google/callback"
            
            # Google OAuth2 authorization URL
            auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
            
            params = {
                'client_id': client_id,
                'redirect_uri': callback_url,
                'scope': ' '.join(google_config.get('SCOPE', ['profile', 'email'])),
                'response_type': 'code',
                'access_type': 'online',
                'prompt': 'select_account',
            }
            
            # Add any additional auth params
            params.update(google_config.get('AUTH_PARAMS', {}))
            
            url = f"{auth_url}?{urlencode(params)}"
            return Response({'url': url})
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class GoogleCallback(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        try:
            code = request.data.get('code')
            if not code:
                return Response({'error': 'Code requis'}, status=400)
            
            # Échange du code
            token_data = self.exchange_code_for_token(code)
            if 'error' in token_data:
                return Response({'error': token_data['error']}, status=400)
            
            # Récupération infos utilisateur
            user_info = self.get_user_info(token_data['access_token'])
            if 'error' in user_info:
                return Response({'error': user_info['error']}, status=400)
            
            # Création utilisateur
            user = self.get_or_create_user(user_info)
            
            # Utilisez le même système que LoginView (Token DRF)
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'token': token.key,  # Même format que LoginView
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
    def exchange_code_for_token(self, code):
        """Exchange authorization code for access token"""
        try:
            google_config = settings.SOCIALACCOUNT_PROVIDERS['google']
            
            token_url = "https://oauth2.googleapis.com/token"
            data = {
                'client_id': google_config['APP']['client_id'],
                'client_secret': google_config['APP']['secret'],
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': "http://localhost:3000/auth/google/callback",
            }
            
            response = requests.post(token_url, data=data)
            return response.json()
            
        except Exception as e:
            return {'error': str(e)}
    
    def get_user_info(self, access_token):
        """Get user information from Google"""
        try:
            user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
            headers = {'Authorization': f'Bearer {access_token}'}
            
            response = requests.get(user_info_url, headers=headers)
            return response.json()
            
        except Exception as e:
            return {'error': str(e)}
    
    def get_or_create_user(self, user_info):
        """Create or get existing user"""
        email = user_info.get('email')
        first_name = user_info.get('given_name', '')
        last_name = user_info.get('family_name', '')
        google_id = user_info.get('id')
        
        # Try to find existing user by email
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,  # Use email as username
                'first_name': first_name,
                'last_name': last_name,
                'is_active': True,
            }
        )
        
        # Update user info if user already exists
        if not created:
            user.first_name = first_name
            user.last_name = last_name
            user.save()
        
        return user

class UserStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return Response({
            'is_authenticated': True,
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
        })

# Database cleanup utility (run this once to fix duplicate tokens)
class CleanupSocialTokens(APIView):
    permission_classes = [permissions.AllowAny]  
    
    def post(self, request):
        try:
            from allauth.socialaccount.models import SocialToken, SocialApp
            
            # Get all social apps
            apps = SocialApp.objects.all()
            
            for app in apps:
                # Get duplicate tokens for each account
                from django.db.models import Count
                duplicate_accounts = SocialToken.objects.values('account', 'app').annotate(
                    count=Count('id')
                ).filter(count__gt=1)
                
                for dup in duplicate_accounts:
                    # Keep the most recent token, delete the rest
                    tokens = SocialToken.objects.filter(
                        account_id=dup['account'],
                        app_id=dup['app']
                    ).order_by('-id')
                    
                    # Delete all but the first (most recent)
                    for token in tokens[1:]:
                        token.delete()
            
            return Response({'message': 'Duplicate tokens cleaned up successfully'})
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        try:
          
            if 'email' in request.data:
                user.email = request.data['email']
            if 'first_name' in request.data:
                user.first_name = request.data['first_name']
            if 'last_name' in request.data:
                user.last_name = request.data['last_name']
            
          
            user.save(update_fields=['email', 'first_name', 'last_name'])
            
            # Renvoie les données utilisateur mises à jour directement à partir de la base de données
            updated_user = User.objects.get(pk=user.pk)
            return Response({
                'id': updated_user.id,
                'username': updated_user.username,
                'email': updated_user.email,
                'first_name': updated_user.first_name,
                'last_name': updated_user.last_name
            })
            
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        
        if not serializer.is_valid():
            return Response(
                {"errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            update_session_auth_hash(request, user)
            return Response({"detail": "Le mot de passe a été modifié avec succès"}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

def get_user_banking_apps(user):
    """الحصول على جميع التطبيقات البنكية الخاصة بالمستخدم"""
    if user.is_staff:
        return BankingApp.objects.all()
    return BankingApp.objects.filter(created_by__id=user.id)

class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        banking_apps = get_user_banking_apps(user)
        return super().get_queryset().filter(banking_app__in=banking_apps)

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all().order_by('-date')
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['tran_type', 'compte_expediteur', 'compte_destinataire']
    search_fields = [
        'tran_code', 'nom_expediteur', 'nom_destinataire',
        'nom_banque', 'compte_bancaire'
    ]

    def get_queryset(self):
        user = self.request.user
        banking_apps = get_user_banking_apps(user)
        queryset = super().get_queryset().filter(banking_app__in=banking_apps)
        
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
            
        return queryset

class LoanViewSet(viewsets.ModelViewSet):
    queryset = Loan.objects.all()
    serializer_class = LoanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        banking_apps = get_user_banking_apps(user)
        return super().get_queryset().filter(banking_app__in=banking_apps)

class DepositViewSet(viewsets.ModelViewSet):
    queryset = Deposit.objects.all()
    serializer_class = DepositSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        banking_apps = get_user_banking_apps(user)
        return super().get_queryset().filter(banking_app__in=banking_apps)

class JournalEntryListCreate(generics.ListCreateAPIView):
    queryset = JournalEntry.objects.all().select_related(
        'debit_account', 'credit_account', 'transaction'
    )
    serializer_class = JournalEntrySerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['debit_account', 'credit_account', 'date']
    search_fields = ['description', 'debit_account__name', 'credit_account__name']

    def get_queryset(self):
        user = self.request.user
        banking_apps = get_user_banking_apps(user)
        return super().get_queryset().filter(banking_app__in=banking_apps)

class JournalEntryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = JournalEntry.objects.all().select_related(
        'debit_account', 'credit_account', 'transaction'
    )
    serializer_class = JournalEntrySerializer
    permission_classes = [IsAuthenticated]

class GrandLivreAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, account_id):
        try:
            user = request.user
            banking_apps = get_user_banking_apps(user)
            account = Account.objects.get(id=account_id, banking_app__in=banking_apps)
        except Account.DoesNotExist:
            return Response({"error": "Account not found or not authorized."}, status=status.HTTP_404_NOT_FOUND)

        # Get JournalEntry debits where this account is debited
        journal_debits = JournalEntry.objects.filter(debit_account=account).order_by('date', 'id')
        
        # Get JournalEntry credits where this account is credited
        journal_credits = JournalEntry.objects.filter(credit_account=account).order_by('date', 'id')

        # Combine all entries
        combined_entries = []
        
        # Add journal debits
        for entry in journal_debits:
            combined_entries.append({
                'type': 'journal_debit',
                'date': entry.date,
                'description': entry.description,
                'amount': entry.debit_amount,
                'entry_id': entry.id
            })
        
        # Add journal credits
        for entry in journal_credits:
            combined_entries.append({
                'type': 'journal_credit',
                'date': entry.date,
                'description': entry.description,
                'amount': entry.credit_amount,
                'entry_id': entry.id
            })
        
        # Sort by date then by entry ID for consistent ordering
        combined_entries.sort(key=lambda x: (x['date'], x['entry_id']))

        # Calculate balance and prepare ledger entries
        running_balance = Decimal('0.00')
        ledger_entries = []
        
        for entry in combined_entries:
            if entry['type'] == 'journal_debit':
                running_balance -= entry['amount']
                debit = entry['amount']
                credit = ''
            elif entry['type'] == 'journal_credit':
                running_balance += entry['amount']
                debit = ''
                credit = entry['amount']
            
            ledger_entries.append(OrderedDict({
                "date": entry['date'].strftime('%d/%m/%Y'),
                "description": entry['description'],
                "debit": str(debit) if debit != '' else '',
                "credit": str(credit) if credit != '' else '',
                "balance": str(running_balance),
                "entry_id": entry['entry_id']
            }))

        return Response({
            "account": account.name,
            "ledger": ledger_entries
        })
      
class GrandLivreAllAccountsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        banking_apps = get_user_banking_apps(user)
        accounts = Account.objects.filter(banking_app__in=banking_apps)
        all_ledgers = []

        for account in accounts:
            # JournalEntry where account is debited
            journal_debits = JournalEntry.objects.filter(debit_account=account).order_by('date', 'id')
            
            # JournalEntry where account is credited
            journal_credits = JournalEntry.objects.filter(credit_account=account).order_by('date', 'id')

            # Combine all entries
            combined_entries = []
            
            # Add journal debits
            for entry in journal_debits:
                combined_entries.append({
                    'type': 'journal_debit',
                    'date': entry.date,
                    'description': entry.description,
                    'amount': entry.debit_amount,
                    'entry_id': entry.id
                })
            
            # Add journal credits
            for entry in journal_credits:
                combined_entries.append({
                    'type': 'journal_credit',
                    'date': entry.date,
                    'description': entry.description,
                    'amount': entry.credit_amount,
                    'entry_id': entry.id
                })
            
            # Sort by date then by entry ID
            combined_entries.sort(key=lambda x: (x['date'], x['entry_id']))
            
            # Calculate balance and prepare ledger entries
            running_balance = Decimal('0.00')
            ledger_entries = []
            
            for entry in combined_entries:
                if entry['type'] == 'journal_debit':
                    running_balance -= entry['amount']
                    debit = entry['amount']
                    credit = ''
                elif entry['type'] == 'journal_credit':
                    running_balance += entry['amount']
                    debit = ''
                    credit = entry['amount']
                
                ledger_entries.append(OrderedDict({
                    "date": entry['date'].strftime('%d/%m/%Y'),
                    "description": entry['description'],
                    "debit": str(debit) if debit != '' else '',
                    "credit": str(credit) if credit != '' else '',
                    "balance": str(running_balance),
                    "entry_id": entry['entry_id']
                }))

            all_ledgers.append({
                "account_id": account.id,
                "account_name": account.name,
                "ledger": ledger_entries
            })

        return Response(all_ledgers)

class BankingAppViewSet(viewsets.ModelViewSet):
    queryset = BankingApp.objects.all()
    serializer_class = BankingAppSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        يحدد هذا الأسلوب الاستعلام الذي سيتم استخدامه لعرض التطبيقات البنكية.
        - المسؤول (admin) يرى جميع التطبيقات.
        - المستخدم العادي يرى فقط التطبيقات التي أنشأها.
        """
        user = self.request.user
        
        # تحقق من أن المستخدم موجود ومصدق عليه
        if not user or not user.is_authenticated:
            return BankingApp.objects.none()
        
        # تحقق من أن المستخدم هو نموذج User الصحيح
        if not isinstance(user, User):
            raise ValueError("نوع المستخدم غير صالح")
        
        # للمسؤولين: عرض كل التطبيقات
        if user.is_staff:
            return self.queryset.all()
        
        # للمستخدمين العاديين: عرض فقط التطبيقات التي أنشأوها
        return self.queryset.filter(created_by__id=user.id)

    def perform_create(self, serializer):
        # ربط التطبيق بالمستخدم الحالي تلقائيًا
        serializer.save(created_by=self.request.user)


class ReceiveExternalData(APIView):
    authentication_classes = []  
    permission_classes = []

    def post(self, request, app_name):
        # استخراج api_key و secret_key من header
        api_key = request.headers.get('X-API-Key')
        secret_key = request.headers.get('X-Secret-Key')

        try:
            banking_app = BankingApp.objects.get(name=app_name, api_key=api_key, secret_key=secret_key)
        except BankingApp.DoesNotExist:
            return Response({'error': 'Invalid credentials or app'}, status=status.HTTP_403_FORBIDDEN)

        data_type = request.data.get('type')  # 'account' or 'transaction'
        payload = request.data.get('data')

        # if data_type == 'account':
        #     serializer = ExternalAccountSerializer(data=payload)
        #     if serializer.is_valid():
        #         account = serializer.save(banking_app=banking_app)
        #         return Response(serializer.data, status=status.HTTP_201_CREATED)
        #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if data_type == 'account':
          account_number = payload.get('account_number')  
          try:
              # حاول العثور على الحساب الموجود
              account = Account.objects.get(account_number=account_number, banking_app=banking_app)
              serializer = ExternalAccountSerializer(account, data=payload, partial=True)  # partial=True للتحديث الجزئي
          except Account.DoesNotExist:
              # إذا لم يوجد الحساب، قم بإنشائه
              serializer = ExternalAccountSerializer(data=payload)
          
          if serializer.is_valid():
              serializer.save(banking_app=banking_app)
              return Response(serializer.data, status=status.HTTP_201_CREATED if not account else status.HTTP_200_OK)
          return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif data_type == 'transaction':
            serializer = ExternalTransactionSerializer(data=payload)
            if serializer.is_valid():
                transaction = serializer.save(banking_app=banking_app)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response({'error': 'Invalid data type'}, status=status.HTTP_400_BAD_REQUEST)

# Admin 

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def list(self, request):
        # للتحقق من الصلاحيات
        if not request.user.has_perm('auth.view_user'):
            return Response(
                {"detail": "ليس لديك صلاحية لعرض المستخدمين"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        users = self.get_queryset()
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)

    def partial_update(self, request, pk=None):
        # Vérification des permissions
        if not request.user.has_perm('auth.change_user'):
            return Response(
                {"detail": "ليس لديك صلاحية لتعديل المستخدمين"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_active': user.is_active,
            'first_name': user.first_name,  
            'last_name': user.last_name,
            'permissions': list(user.get_all_permissions()),
        })


@api_view(['GET'])
def transaction_report(request):

    user = request.user
    banking_app = get_user_banking_apps(user)
    # Get start and end dates from query parameters
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')

    # Initialize journal entries queryset
    journal_entries = JournalEntry.objects.filter(banking_app__in=banking_app)

    # Apply date filtering if dates are provided
    if start_date and end_date:
        try:
            # Convert dates to date objects (JournalEntry uses DateField)
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()

            # Filter journal entries based on date range
            journal_entries = journal_entries.filter(date__range=(start_date, end_date))

        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)

    # Separate debit and credit entries
    debit_entries = []
    credit_entries = []
    
    for entry in journal_entries:
        if entry.debit_account and entry.debit_amount:
            debit_entries.append({
                'account': entry.debit_account.name,
                'amount': entry.debit_amount,
                'date': entry.date,
                'type': 'journal_entry',
                'entry_id': entry.id,
                'description': entry.description
            })
        
        if entry.credit_account and entry.credit_amount:
            credit_entries.append({
                'account': entry.credit_account.name,
                'amount': entry.credit_amount,
                'date': entry.date,
                'type': 'journal_entry',
                'entry_id': entry.id,
                'description': entry.description
            })

    # Calculate totals
    total_debit = sum([entry['amount'] for entry in debit_entries])
    total_credit = sum([entry['amount'] for entry in credit_entries])

    # Structure the report
    report = {
        'debits': debit_entries,
        'credits': credit_entries,
        'total_debit': total_debit,
        'total_credit': total_credit
    }

    # Check if there are no entries in the date range
    if not journal_entries:
        return Response({"message": "No journal entries found in the specified date range."})

    return Response(report)

@api_view(['GET'])
def financial_report(request):
    user = request.user
    banking_app = get_user_banking_apps(user)

    # Fetch data
    accounts = Account.objects.filter(banking_app__in=banking_app)
    loans = Loan.objects.filter(banking_app__in=banking_app)
    deposits = Deposit.objects.filter(banking_app__in=banking_app)

    total_loan_amount = loans.aggregate(Sum('amount'))['amount__sum'] or Decimal(0)
    total_deposit_amount = deposits.aggregate(Sum('amount'))['amount__sum'] or Decimal(0)

    # Total interest calculation
    total_interest = sum([loan.calculate_interest() for loan in loans])

    # Total interest deposit calculation
    total_interestDeposit = sum([deposit.calculate_interestDeposit() for deposit in deposits])
    
    # Calculate total balance of all accounts
    total_balances = accounts.aggregate(Sum('balance'))['balance__sum'] or Decimal(0)

    # Calculate total balance by account type
    total_balances_by_type = accounts.values('client_type').annotate(
        total_balance=Sum('balance')
    )

    # Group accounts by client_type
    accounts_by_type = defaultdict(list)
    for acc in accounts:
        accounts_by_type[acc.client_type].append({
            'account': acc.name,
            'balance': float(acc.balance),
        })

    accounts_by_type_list = [
        {
            'client_type': client_type,
            'accounts': accs
        }
        for client_type, accs in accounts_by_type.items()
    ]

    # Construct report
    report = {
        'accounts': [
            {
                'account_number': account.account_number,
                'name': account.name,
                'balance': float(account.balance),
                'client_type': account.client_type
            } for account in accounts
        ],
        'total_balances': float(total_balances),  # Include total balance
        'total_balances_by_type': [
            {
                'client_type': balance['client_type'],
                'total_balance': float(balance['total_balance'])
            } for balance in total_balances_by_type
        ],
        'repartition_by_type': accounts_by_type_list,
        
        'loans': {
            'total_loan_amount': float(total_loan_amount),
            'total_interest': float(total_interest),
            'loans': [
                {
                    'account': loan.account.name,
                    'amount': float(loan.amount),
                    'interest_rate': float(loan.interest_rate),
                    'start_date': loan.start_date,
                    'end_date': loan.end_date,
                    'interest': float(loan.calculate_interest())
                } for loan in loans
            ]
        },
        'deposits': {
            'total_deposit_amount': float(total_deposit_amount),
            'total_interestDeposit': float(total_interestDeposit),
            'deposits': [
                {
                    'account': deposit.account.name,
                    'amount': float(deposit.amount),
                    'interest_rate': float(deposit.interest_rate),
                    'deposit_date': deposit.deposit_date,
                    'maturity_date': deposit.maturity_date,
                    'interest': float(deposit.calculate_interestDeposit())
                } for deposit in deposits
            ]
        }
    }

    return Response(report)

def get_exchange_rate(from_currency, to_currency):
    url = f"https://openexchangerates.org/api/latest.json?app_id=f0f88089ee28457e83b68cd25664f9aa"
    response = requests.get(url)
    data = response.json()
    rates = data.get('rates', {})
    return rates.get(to_currency) / rates.get(from_currency)

def convert_currency(request, from_currency, to_currency, amount):
    try:
        amount = float(amount)  
        rate = get_exchange_rate(from_currency, to_currency)
        converted_amount = round(amount * rate, 2)
        return JsonResponse({'converted_amount': converted_amount})
    except ValueError:
        return JsonResponse({'error': 'Invalid amount format'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

def calculate_loan_interest(request, loan_id):
    try:
        loan = Loan.objects.get(id=loan_id)
        amount = Decimal(loan.amount or 0)
        interest_rate = Decimal(loan.interest_rate or 0)
        if not (loan.start_date and loan.end_date):
            raise ValueError("Loan dates are not properly set")
        tenure_days = (loan.end_date - loan.start_date).days

        interest = amount * (interest_rate / Decimal(100)) 
        total_payable = amount + interest

        return JsonResponse({
            'principal': float(amount),
            'interest': float(interest),
            'total_payable': float(total_payable),
            'rate': float(interest_rate),
            'tenure': tenure_days // 30  # Convert days to months
        })
    except Loan.DoesNotExist:
        return JsonResponse({'error': 'Loan not found'}, status=404)
    except ValueError as ve:
        return JsonResponse({'error': str(ve)}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

def calculate_deposit_interest(request, deposit_id):
    try:
        deposit = Deposit.objects.get(id=deposit_id)
        amount = Decimal(deposit.amount or 0)
        interest_rate = Decimal(deposit.interest_rate or 0)
        if not (deposit.deposit_date and deposit.maturity_date):
            raise ValueError("Deposit dates are not properly set")
        tenure_days = (deposit.maturity_date - deposit.deposit_date).days

        interest = amount * (interest_rate / Decimal(100)) 
        total_payable = amount - interest

        return JsonResponse({
            'principal': float(amount),
            'interest': float(interest),
            'total_payable': float(total_payable),
            'rate': float(interest_rate),
            'tenure': tenure_days // 30  # Convert days to months
        })
    except Deposit.DoesNotExist:
        return JsonResponse({'error': 'Deposit not found'}, status=404)
    except ValueError as ve:
        return JsonResponse({'error': str(ve)}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@api_view(['GET'])
def dashboard_data(request):
    user = request.user
    banking_app = get_user_banking_apps(user)
    # بيانات المعاملات
    Envoi_transactions = Transaction.objects.filter(tran_type='ENVOI').filter(banking_app__in=banking_app)
    Paiement_transactions = Transaction.objects.filter(tran_type='PAIEMENT').filter(banking_app__in=banking_app)
    Versement_transactions = Transaction.objects.filter(tran_type='COMP_VERSEMENT').filter(banking_app__in=banking_app)
    Retrait_Compte_transactions = Transaction.objects.filter(tran_type='RETRAIT_COMPTE').filter(banking_app__in=banking_app)
    Retrait_transactions = Transaction.objects.filter(tran_type='RETRAIT').filter(banking_app__in=banking_app)
    Recharge_transactions = Transaction.objects.filter(tran_type='RECHARGE').filter(banking_app__in=banking_app)
    Paiement_Credit_transactions = Transaction.objects.filter(tran_type='PAIEMENT_CREDIT').filter(banking_app__in=banking_app)
    Paiement_Facture_transactions = Transaction.objects.filter(tran_type='PAIEMENT_FACTURE').filter(banking_app__in=banking_app)

    
    total_Envoi = Envoi_transactions.aggregate(Sum('montant'))['montant__sum'] or Decimal(0)
    total_Paiement = Paiement_transactions.aggregate(Sum('montant'))['montant__sum'] or Decimal(0)
    total_Versement = Versement_transactions.aggregate(Sum('montant'))['montant__sum'] or Decimal(0)
    total_Retrait_Compte = Retrait_Compte_transactions.aggregate(Sum('montant'))['montant__sum'] or Decimal(0)
    total_Paiement_Credit = Paiement_Credit_transactions.aggregate(Sum('montant'))['montant__sum'] or Decimal(0)
    total_Retrait = Retrait_transactions.aggregate(Sum('montant'))['montant__sum'] or Decimal(0)
    total_Recharge = Recharge_transactions.aggregate(Sum('montant'))['montant__sum'] or Decimal(0)
    total_Paiement_Facture = Paiement_Facture_transactions.aggregate(Sum('montant'))['montant__sum'] or Decimal(0)


    # حساب 3 أكبر قروض
    top_loans = Loan.objects.all().filter(banking_app__in=banking_app).order_by('-amount')[:3]

    # حساب 3 أكبر ودائع
    top_deposits = Deposit.objects.all().filter(banking_app__in=banking_app).order_by('-amount')[:3]

    # مجموع الأرصدة حسب نوع الحساب
    account_balances_by_type = Account.objects.values('client_type').filter(banking_app__in=banking_app).annotate(total_balance=Sum('balance'))

    top_account = Account.objects.all().filter(banking_app__in=banking_app).order_by('-balance')[:5]

    # Initialiser les variables pour tous les utilisateurs
    total_banking_apps = None
    top_banks_data = {
        'by_accounts': [],
        'by_transactions': [],
        'by_loans': [],
        'by_deposits': []
    }
    
    # is staff user
    if user.is_staff:
        total_banking_apps = BankingApp.objects.count()

        # Remplir les données top banks directement dans le dictionnaire
        top_banks_data['by_accounts'] = [
            {'name': bank.name, 'account_count': bank.account_count}
            for bank in BankingApp.objects.annotate(
                account_count=Count('accounts')
            ).order_by('-account_count')[:3]
        ]
        
        top_banks_data['by_transactions'] = [
            {'name': bank.name, 'transaction_count': bank.transaction_count}
            for bank in BankingApp.objects.annotate(
                transaction_count=Count('transactions')
            ).order_by('-transaction_count')[:3]
        ]
        
        top_banks_data['by_loans'] = [
            {'name': bank.name, 'loan_amount': float(bank.loan_amount or 0)}
            for bank in BankingApp.objects.annotate(
                loan_amount=Coalesce(Sum('loans__amount'), 0, output_field=DecimalField(max_digits=15, decimal_places=2))
            ).order_by('-loan_amount')[:3]
        ]
        
        top_banks_data['by_deposits'] = [
            {'name': bank.name, 'deposit_amount': float(bank.deposit_amount or 0)}
            for bank in BankingApp.objects.annotate(
                deposit_amount=Coalesce(Sum('deposits__amount'), 0, output_field=DecimalField(max_digits=15, decimal_places=2))
            ).order_by('-deposit_amount')[:3]
        ]
        
    
    total_accounts = Account.objects.all().filter(banking_app__in=banking_app).count()
    
    total_transactions = Transaction.objects.all().filter(banking_app__in=banking_app).count()
  
    total_loans = Loan.objects.all().filter(banking_app__in=banking_app).count()
    
    total_deposits = Deposit.objects.all().filter(banking_app__in=banking_app).count()

    # إعداد البيانات للـ Dashboard
    data = {
        'top_banks': top_banks_data,
        'total_banking_apps': total_banking_apps,
        'total_accounts': total_accounts,
        'total_transactions': total_transactions,
        'total_loans': total_loans,
        'total_deposits': total_deposits,
        
        'transactions': {
            'total_Envoi': float(total_Envoi),
            'total_Paiement': float(total_Paiement),
            'total_Versement': float(total_Versement),
            'total_Retrait_Compte': float(total_Retrait_Compte),
            'total_Paiement_Credit': float(total_Paiement_Credit),
            'total_Retrait': float(total_Retrait),
            'total_Recharge': float(total_Recharge),
            'total_Paiement_Facture': float(total_Paiement_Facture)
        },
        
        'top_loans': [
            {
                'account': loan.account.name,
                'amount': float(loan.amount),
                'interest_rate': float(loan.interest_rate),
                'start_date': loan.start_date,
                'end_date': loan.end_date
            } for loan in top_loans
        ],
        'top_deposits': [
            {
                'account': deposit.account.name,
                'amount': float(deposit.amount),
                'interest_rate': float(deposit.interest_rate),
                'deposit_date': deposit.deposit_date,
                'maturity_date': deposit.maturity_date
            } for deposit in top_deposits
        ],
        'account_balances_by_type': [
            {
                'client_type': balance['client_type'],
                'total_balance': float(balance['total_balance'])
            } for balance in account_balances_by_type
        ],
        'top_account': [
            {
                'name': account.name,
                'balance': account.balance,
            } for account in top_account
        ]
    }

    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def import_accounts_csv(request):
    if 'file' not in request.FILES:
        return JsonResponse({'error': 'No file uploaded'}, status=400)

    file = request.FILES['file']
    if not file.name.endswith('.csv'):
        return JsonResponse({'error': 'File is not a CSV'}, status=400)

    banking_apps = BankingApp.objects.filter(created_by__id=request.user.id)
    if not banking_apps.exists():
        return Response({"error": "No associated BankingApp found for this user."}, status=400)
    banking_app = banking_apps.first()  

    try:
        # Lire le contenu du fichier en mémoire
        file_content = file.read()
        
        # Essayer plusieurs encodages courants
        encodings_to_try = ['utf-8', 'iso-8859-1', 'windows-1252']
        reader = None
        csv_content = None
        
        for encoding in encodings_to_try:
            try:
                # Convertir le contenu avec l'encodage testé
                decoded_content = file_content.decode(encoding)
                csv_content = io.StringIO(decoded_content)
                reader = csv.DictReader(csv_content)
                
                
                break  # Si on arrive ici, l'encodage fonctionne
            except (UnicodeDecodeError, StopIteration):
                if csv_content:
                    csv_content.close()
                continue
        
        if reader is None:
            return JsonResponse({'error': 'Impossible de décoder le fichier CSV. Essayez de le sauvegarder en UTF-8.'}, status=400)

        imported_count = 0
        errors = []

        try:
            for row_num, row in enumerate(reader, start=1):
                try:
                    # Valider les champs obligatoires
                    required_fields = ['Compte Wallet', 'Nom du client', 'Solde']
                    for field in required_fields:
                        if field not in row or not row[field].strip():
                            raise ValidationError(f"Le champ {field} est obligatoire")

                    # Convertir la date de création
                    created_date = timezone.now()
                    if row.get('Date Creation'):
                        try:
                            date_str = row['Date Creation'].strip()
                            # Essayer plusieurs formats de date
                            for date_format in ['%d/%m/%y %H:%M:%S', '%d/%m/%Y %H:%M:%S', '%Y-%m-%d %H:%M:%S']:
                                try:
                                    created_date = datetime.strptime(date_str, date_format)
                                    created_date = timezone.make_aware(created_date)
                                    break
                                except ValueError:
                                    continue
                            else:
                                # Si aucun format ne fonctionne, essayer le parser générique
                                created_date = parser.parse(date_str)
                                if not timezone.is_aware(created_date):
                                    created_date = timezone.make_aware(created_date)
                        except Exception as e:
                            errors.append(f"Ligne {row_num}: Format de date invalide - {str(e)}")
                            created_date = timezone.now()

                    # Nettoyer les valeurs numériques
                    def clean_decimal(value):
                        if not value:
                            return Decimal('0.0')
                        try:
                            # Remplacer les virgules par des points et supprimer les espaces
                            clean_value = str(value).replace(',', '.').strip()
                            return Decimal(clean_value)
                        except InvalidOperation:
                            return Decimal('0.0')

                    # Créer le compte
                    account_data = {
                        'account_number': row['Compte Wallet'].strip(),
                        'bank_account': row.get('Compte Bancaire', '').strip() or None,
                        'name': row['Nom du client'].strip(),
                        'balance': clean_decimal(row['Solde']),
                        'hold_balance': clean_decimal(row.get('Hold Balance', '0.0')),
                        'hold_ecommerce': clean_decimal(row.get('Hold E-commerce', '0.0')),
                        'client_type': row.get('Type client', '').strip().upper() or 'CLIENT',
                        'status': row.get('Statut', '').strip().upper() or 'ACTIVE',
                        'created_date': created_date,
                        # 'banking_app': banking_app
                    }

                    # Valider les choix
                    if account_data['client_type'] not in dict(Account.CLIENT_TYPE_CHOICES).keys():
                        raise ValidationError(f"Type de client invalide: {account_data['client_type']}")

                    if account_data['status'] not in dict(Account.STATUS_CHOICES).keys():
                        raise ValidationError(f"Statut invalide: {account_data['status']}")

                    # Créer ou mettre à jour le compte
                    account, created = Account.objects.update_or_create(
                        account_number=account_data['account_number'],
                        defaults=account_data
                    )
                    
                    imported_count += 1

                except Exception as e:
                    errors.append(f"Ligne {row_num}: {str(e)}")
                    continue

            if errors:
                return JsonResponse({
                    'message': f'{imported_count} comptes importés avec {len(errors)} erreurs',
                    'errors': errors
                }, status=207)
            
            return JsonResponse({'message': f'Successfully imported {imported_count} accounts'}, status=200)

        finally:
            if csv_content:
                csv_content.close()

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)

    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def import_transactions_csv(request):
    if 'file' not in request.FILES:
        return JsonResponse({'error': 'No file uploaded'}, status=400)

    file = request.FILES['file']
    if not file.name.endswith('.csv'):
        return JsonResponse({'error': 'File is not a CSV'}, status=400)

    banking_apps = BankingApp.objects.filter(created_by__id=request.user.id)
    if not banking_apps.exists():
        return Response({"error": "No associated BankingApp found for this user."}, status=400)
    banking_app = banking_apps.first()  

    try:
        csv_file = TextIOWrapper(file, encoding='utf-8')
        reader = csv.DictReader(csv_file)
        imported_count = 0
        errors = []

        for row_num, row in enumerate(reader, start=1):
            try:
                if Transaction.objects.filter(tran_code=row['Tran Code']).exists():
                    continue

                date_str = row['Date']
                naive_date = datetime.strptime(date_str, '%d/%m/%y %H:%M:%S')
                aware_date = timezone.make_aware(naive_date)

                def get_field(value, default=''):
                    return value if value and str(value).strip() != '' else default

                def parse_decimal(value):
                    try:
                        val = Decimal(value) if value and str(value).strip() != '' else Decimal('0')
                        return val.quantize(Decimal('0.00'))  # Round to 2 decimal places
                    except InvalidOperation:
                        return Decimal('0')

                tran_type = row['Tran Type']
                
                if tran_type == 'RECHARGE':
                    compte_expediteur = ''
                    nom_expediteur = ''
                    compte_destinataire = get_field(row['Compte Expediteur'])
                    nom_destinataire = get_field(row['Nom Expediteur'])
                elif tran_type == 'RETRAIT':
                    compte_expediteur = get_field(row['Compte Expediteur'], '0')
                    nom_expediteur = get_field(row['Nom Expediteur'], '')
                    compte_destinataire = get_field(row['Compte Destinataire'])
                    nom_destinataire = get_field(row['Nom Destinataire'])
                else:
                    compte_expediteur = get_field(row['Compte Expediteur'])
                    nom_expediteur = get_field(row['Nom Expediteur'])
                    compte_destinataire = get_field(row['Compte Destinataire'])
                    nom_destinataire = get_field(row['Nom Destinataire'])

                transaction = Transaction(
                    date=aware_date,
                    tran_code=row['Tran Code'],
                    tran_type=tran_type,
                    compte_expediteur=compte_expediteur,
                    nom_expediteur=nom_expediteur,
                    compte_destinataire=compte_destinataire,
                    nom_destinataire=nom_destinataire,
                    compte_bancaire=get_field(row.get('Compte Bancaire', '')),
                    nom_banque=get_field(row.get('Nom Banque', '')),
                    montant=parse_decimal(row['Montant']),
                    commission_banque=parse_decimal(row['Commission Banque']),
                    commission_agence=parse_decimal(row.get('Commision Agence', '0')),
                    tof=parse_decimal(row.get('TOF', '0')),
                     banking_app=banking_app
                )
                
                transaction.full_clean()
                transaction.save()
                imported_count += 1

            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
                continue

        if errors:
            return JsonResponse({
                'message': f'Imported {imported_count} transactions with {len(errors)} errors',
                'errors': errors
            }, status=207)
        
        return JsonResponse({'message': f'Successfully imported {imported_count} transactions'}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def import_csv(request):
    if 'file' not in request.FILES:
        return JsonResponse({'error': 'No file uploaded'}, status=400)

    file = request.FILES['file']
    if not file.name.endswith('.csv'):
        return JsonResponse({'error': 'File is not a CSV'}, status=400)

    banking_apps = BankingApp.objects.filter(created_by__id=request.user.id)
    if not banking_apps.exists():
        return Response({"error": "No associated BankingApp found for this user."}, status=400)
    banking_app = banking_apps.first() 


    try:
        csv_file = TextIOWrapper(file, encoding='utf-8')
        reader = csv.DictReader(csv_file, delimiter=';')

        for row in reader:
            try:
                # Parse date
                try:
                    date = parser.parse(row['Date']).date()
                except ValueError as e:
                    return JsonResponse({'error': f'Invalid date format in CSV: {str(e)}'}, status=400)

                description = row['Description']
                
                # Handle accounts and amounts
                debit_account_name = row['Compte Débit'].strip() or None
                credit_account_name = row['Compte Crédit'].strip() or None

                # Convert amounts, treating empty as None
                debit_amount = Decimal(row['Montant Débit']) if row['Montant Débit'].strip() and Decimal(row['Montant Débit']) != Decimal('0') else None
                credit_amount = Decimal(row['Montant Crédit']) if row['Montant Crédit'].strip() and Decimal(row['Montant Crédit']) != Decimal('0') else None

                # Validate we have at least one account and amount
                if not debit_account_name and not credit_account_name:
                    return JsonResponse({'error': 'At least one account must be specified'}, status=400)
                
                if not debit_amount and not credit_amount:
                    return JsonResponse({'error': 'At least one amount must be specified'}, status=400)

                # Get accounts
                debit_account = None
                credit_account = None
                
                if debit_account_name:
                    try:
                        debit_account = Account.objects.get(name=debit_account_name)
                    except Account.DoesNotExist:
                        return JsonResponse({'error': f'Debit account not found: {debit_account_name}'}, status=400)
                
                if credit_account_name:
                    try:
                        credit_account = Account.objects.get(name=credit_account_name)
                    except Account.DoesNotExist:
                        return JsonResponse({'error': f'Credit account not found: {credit_account_name}'}, status=400)

                # If both amounts exist, they must be equal
                if debit_amount and credit_amount and debit_amount != credit_amount:
                    return JsonResponse({'error': 'Debit and Credit amounts must be equal when both exist'}, status=400)

                # Create journal entry
                JournalEntry.objects.create(
                    date=date,
                    description=description,
                    debit_account=debit_account,
                    credit_account=credit_account,
                    debit_amount=debit_amount,
                    credit_amount=credit_amount,
                     banking_app=banking_app
                )

            except KeyError as e:
                return JsonResponse({'error': f'Missing key in CSV: {str(e)}'}, status=400)
            except ValueError as e:
                return JsonResponse({'error': f'Invalid value in CSV: {str(e)}'}, status=400)
            except DecimalException as e:
                return JsonResponse({'error': f'Invalid decimal value: {str(e)}'}, status=400)

        return JsonResponse({'message': 'CSV imported successfully'}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


class ValidateResetTokenView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        token = request.data.get('token')
        
        if not token:
            return Response(
                {"valid": False, "message": "Token is missing"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        token_obj = ResetPasswordToken.objects.filter(key=token).first()
        
        if not token_obj:
            return Response(
                {"valid": False, "message": "Invalid token"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if token is expired (default expiration is 24 hours)
        if (timezone.now() - token_obj.created_at).total_seconds() > 24 * 3600:
            return Response(
                {"valid": False, "message": "Expired token"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        return Response({"valid": True, "message": "Token is valid"})