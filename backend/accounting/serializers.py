from django.utils import timezone
from rest_framework import serializers
from .models import Account, BankingApp, Deposit, Loan, Transaction ,JournalEntry,ContactRequest
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import Group, Permission
from accounting.models import CustomUser

from dj_rest_auth.serializers import LoginSerializer, TokenSerializer

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True)

class CustomLoginSerializer(LoginSerializer):
    username = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)

class CustomTokenSerializer(TokenSerializer):
    pass

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            password=make_password(validated_data['password'])
        )
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id', 'username']
    
    def update(self, instance, validated_data):
        
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        
      
        instance.save()
        return instance
    

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    new_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Les nouveaux mots de passe ne correspondent pas"})
        
        validate_password(attrs['new_password'])
        return attrs

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Le mot de passe actuel est incorrect")
        return value

class AccountSerializer(serializers.ModelSerializer):
    created_date = serializers.DateTimeField(
        format="%d/%m/%y %H:%M:%S",
        input_formats=["%d/%m/%y %H:%M:%S", "iso-8601"],
        required=False,
        default=lambda: timezone.now()
    )
    banking_app_name = serializers.StringRelatedField(source='banking_app', read_only=True)
    
    class Meta:
        model = Account
        fields = '__all__'
        extra_kwargs = {
            'bank_account': {'required': False},
            'hold_balance': {'required': False, 'default': 0.0},
            'hold_ecommerce': {'required': False, 'default': 0.0},
        }

class LoanSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    banking_app = serializers.PrimaryKeyRelatedField(
        queryset=BankingApp.objects.all(),
        required=True,
        source='account.banking_app'  # لأن الحساب مربوط بالفعل بـ BankingApp
    )

    class Meta:
        model = Loan
        fields = '__all__'
        extra_kwargs = {
            'start_date': {'required': False},
            'end_date': {'required': False}
        }

class DepositSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    banking_app = serializers.PrimaryKeyRelatedField(
        source='account.banking_app',
        queryset=BankingApp.objects.all(),
        required=True
    )

    class Meta:
        model = Deposit
        fields = '__all__'
        extra_kwargs = {
            'deposit_date': {'required': False},
            'maturity_date': {'required': False}
        }

class TransactionSerializer(serializers.ModelSerializer):
    banking_app_name = serializers.StringRelatedField(source='banking_app', read_only=True)
    class Meta:
        model = Transaction
        fields = [
            'id', 'date', 'tran_code', 'tran_type', 
            'compte_expediteur', 'nom_expediteur',
            'compte_destinataire', 'nom_destinataire',
            'compte_bancaire', 'nom_banque',
            'montant', 'commission_banque', 
            'commission_agence', 'tof', 'created_at',
            'banking_app_name'
        ]
        read_only_fields = ['id', 'created_at']

class JournalEntrySerializer(serializers.ModelSerializer):
    debit_account_name = serializers.CharField(source='debit_account.name', read_only=True, allow_null=True)
    credit_account_name = serializers.CharField(source='credit_account.name', read_only=True, allow_null=True)
    transaction_id = serializers.PrimaryKeyRelatedField(source='transaction', read_only=True),
    banking_app_name = serializers.StringRelatedField(source='banking_app', read_only=True)

    class Meta:
        model = JournalEntry
        fields = [
            'id', 'date', 'description', 'debit_account', 'debit_account_name',
            'debit_amount', 'credit_account', 'credit_account_name', 'credit_amount',
            'transaction_id',
            'banking_app_name'
        ]
        extra_kwargs = {
            'debit_amount': {'required': False, 'allow_null': True},
            'credit_amount': {'required': False, 'allow_null': True}
        }

    def validate(self, data):
        debit_amount = data.get('debit_amount')
        credit_amount = data.get('credit_amount')
        debit_account = data.get('debit_account')
        credit_account = data.get('credit_account')
        
        if debit_amount and credit_amount and debit_amount != credit_amount:
            raise serializers.ValidationError(
                "Debit and Credit amounts must be equal when both exist"
            )
            
        if debit_account and credit_account and debit_account == credit_account:
            raise serializers.ValidationError(
                "Debit and Credit accounts must be different when both exist"
            )
            
        if not debit_account and not credit_account:
            raise serializers.ValidationError(
                "At least one account (debit or credit) must be specified"
            )
            
        return data

class ContactRequestSerializer(serializers.ModelSerializer):
    employees_display = serializers.CharField(
        source='get_employees_display', 
        read_only=True,
        required=False
    )
    
    class Meta:
        model = ContactRequest
        fields = [
            'id',
            'first_name',
            'last_name',
            'email',
            'company',
            'phone',
            'employees',
            'employees_display',
            'message',
            'consent',
            'submitted_at',
            'is_processed',
            'processed_at'
        ]
        extra_kwargs = {
            'consent': {'required': True},
            'is_processed': {'read_only': True},
            'processed_at': {'read_only': True},
            'submitted_at': {'read_only': True},
        }

    def validate_consent(self, value):
        if not value:
            raise serializers.ValidationError("Vous devez accepter notre politique de confidentialité.")
        return value





# Admin 

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename', 'content_type']

class GroupSerializer(serializers.ModelSerializer):
    permissions = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Permission.objects.all(),
        required=False
    )

    permissions_display = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Group
        fields = ['id', 'name', 'permissions', 'permissions_display']
        extra_kwargs = {
            'name': {'required': True},
            'permissions': {'required': False}
        }

    def get_permissions_display(self, obj):
        return [perm.name for perm in obj.permissions.all()]

    def update(self, instance, validated_data):
        permissions = validated_data.pop('permissions', None)
        instance = super().update(instance, validated_data)
        if permissions is not None:
            instance.permissions.set(permissions)
        return instance
    
class UserSerializer(serializers.ModelSerializer):
    groups = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Group.objects.all()
    )
    user_permissions = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Permission.objects.all()
    )
    available_groups = serializers.SerializerMethodField()

    def get_available_groups(self, obj):
        return GroupSerializer(Group.objects.all(), many=True).data

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'groups', 'user_permissions', 'is_active','is_staff', 'available_groups']

class BankingAppSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField()  # عرض اسم المستخدم فقط

    class Meta:
        model = BankingApp
        fields = ['id', 'name', 'api_key', 'secret_key', 'is_active', 'created_at', 'updated_at', 'created_by']
        read_only_fields = ['id', 'api_key', 'secret_key', 'created_at', 'updated_at', 'created_by']

class ExternalAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'
        extra_kwargs = {
            'banking_app': {'required': False}  # سيتم تحديده من الـ BankingApp المرسل
        }

class ExternalTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
        extra_kwargs = {
            'banking_app': {'required': False}
        }