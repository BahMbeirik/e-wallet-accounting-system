from decimal import Decimal
from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from datetime import date
from django.utils import timezone
from django.conf import settings
from django.forms import ValidationError

# Create your models here.

class CustomUser(AbstractUser):
    groups = models.ManyToManyField(
        Group,
        related_name="customuser_set", 
        blank=True
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="customuser_set_permissions", 
        blank=True
    )

class BankingApp(models.Model):
    """
    نموذج لتمثيل التطبيقات البنكية المسجلة في المنصة
    """
    name = models.CharField(max_length=255, verbose_name="Application name")
    api_key = models.CharField(max_length=255, unique=True, blank=True, verbose_name="API Key")
    secret_key = models.CharField(max_length=255, blank=True, verbose_name="Secret Key")
    is_active = models.BooleanField(default=True, verbose_name="Active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='banking_apps',  
        verbose_name="Created by"
    )
    
    
    class Meta:
        verbose_name = 'Banking Application'
        verbose_name_plural = 'Banking Applications'
    
    def generate_api_key(self):
        """توليد مفتاح API فريد"""
        import secrets
        import string
        
        # إنشاء مفتاح API (32 حرف)
        api_key = 'ak_' + ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
        
        # التأكد من أن المفتاح فريد
        while BankingApp.objects.filter(api_key=api_key).exists():
            api_key = 'ak_' + ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
        
        return api_key
    
    def generate_secret_key(self):
        """توليد مفتاح سري"""
        import secrets
        import string
        
        # إنشاء مفتاح سري (64 حرف)
        secret_key = 'sk_' + ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(64))
        return secret_key
    
    def save(self, *args, **kwargs):
        # إنشاء المفاتيح تلقائياً عند الحفظ الأول
        if not self.api_key:
            self.api_key = self.generate_api_key()
        
        if not self.secret_key:
            self.secret_key = self.generate_secret_key()
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name

class Account(models.Model):
    CLIENT_TYPE_CHOICES = [
        ('CLIENT', 'Client'),
        ('COMMERÇANT', 'Commerçant'),
        ('AGENCE', 'Agence'),
    ]

    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('CLOSED', 'Closed'),
    ]
    banking_app = models.ForeignKey(BankingApp, on_delete=models.CASCADE, related_name='accounts')
    account_number = models.CharField(max_length=100, unique=True)
    bank_account = models.CharField(max_length=255, blank=True, null=True)
    name = models.CharField(max_length=255)
    balance = models.DecimalField(max_digits=20, decimal_places=2)
    hold_balance = models.DecimalField(max_digits=20, decimal_places=2, default=0.0)
    hold_ecommerce = models.DecimalField(max_digits=20, decimal_places=2, default=0.0)
    client_type = models.CharField(max_length=20, choices=CLIENT_TYPE_CHOICES, default='CLIENT')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ACTIVE')
    created_date = models.DateTimeField(verbose_name="Date de création du compte")
    import_date = models.DateTimeField(auto_now_add=True, verbose_name="Date d'importation")

    def __str__(self):
        return self.name

class Transaction(models.Model):
    TRANSACTION_TYPE_CHOICES = [
        ('ENVOI', 'Envoi'),
        ('PAIEMENT', 'Paiement'),
        ('COMP_VERSEMENT', 'Versement Compte'),
        ('COMP_RETRAIT', 'Retrait Compte'),
        ('RETRAIT', 'Retrait'),
        ('RECHARGE', 'Recharge'),
        ('PAIEMENT_CREDIT', 'Paiement Crédit'),
        ('PAIEMENT_FACTURE', 'Paiement Facture'),
    ]
    banking_app = models.ForeignKey(BankingApp, on_delete=models.CASCADE, related_name='transactions')
    date = models.DateTimeField()
    tran_code = models.CharField(max_length=20, unique=True)
    tran_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    compte_expediteur = models.CharField(max_length=50, blank=True)
    nom_expediteur = models.CharField(max_length=100, blank=True)
    compte_destinataire = models.CharField(max_length=50, blank=True)
    nom_destinataire = models.CharField(max_length=100, blank=True)
    compte_bancaire = models.CharField(max_length=50, blank=True)
    nom_banque = models.CharField(max_length=100, blank=True)
    montant = models.DecimalField(max_digits=20, decimal_places=2)
    commission_banque = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    commission_agence = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    tof = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def create_journal_entry(self):
        """
        Crée une écriture journalière pour cette transaction
        """
        # Vérifier si une écriture existe déjà
        if hasattr(self, 'journal_entries'):
            return

        # Trouver les comptes correspondants
        try:
            debit_account = Account.objects.get(account_number=self.compte_expediteur)
        except Account.DoesNotExist:
            debit_account = None

        try:
            credit_account = Account.objects.get(account_number=self.compte_destinataire)
        except Account.DoesNotExist:
            credit_account = None

        # Créer la description
        description = f"{self.get_tran_type_display()} - {self.tran_code}"

        # Créer l'écriture journalière seulement si au moins un compte existe
        if debit_account or credit_account:
            JournalEntry.objects.create(
                date=self.date.date(),
                description=description,
                debit_account=debit_account,
                credit_account=credit_account,
                debit_amount=self.montant if debit_account else None,
                credit_amount=self.montant if credit_account else None,
                transaction=self ,
                banking_app=self.banking_app
            )

    def save(self, *args, **kwargs):
        """
        Surcharge de la méthode save pour créer automatiquement l'écriture journalière
        """
        is_new = self._state.adding
        super().save(*args, **kwargs)
        
        if is_new:
            self.create_journal_entry()

    class Meta:
        verbose_name = 'transaction'
        verbose_name_plural = 'transactions'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.tran_code} - {self.get_tran_type_display()} - {self.montant}"
  
class Loan(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField()
    banking_app = models.ForeignKey(BankingApp, on_delete=models.CASCADE, related_name='loans')

    def calculate_interest(self):
        amount = Decimal(self.amount) if self.amount else Decimal(0)
        interest_rate = Decimal(self.interest_rate) if self.interest_rate else Decimal(0)
        start_date = self.start_date
        end_date = self.end_date

        if start_date and end_date:
            tenure_days = (end_date - start_date).days
        else:
            tenure_days = 0

        # Ensure all arithmetic is done using Decimal
        days_in_year = Decimal(365)
        interest = amount * (interest_rate / Decimal(100)) * (Decimal(tenure_days) / days_in_year)
        interest = round(interest ,2)
        return interest
    
class Deposit(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    deposit_date = models.DateField()
    maturity_date = models.DateField()
    banking_app = models.ForeignKey(BankingApp, on_delete=models.CASCADE, related_name='deposits')

    def calculate_interestDeposit(self):
        amount = Decimal(self.amount) if self.amount else Decimal(0)
        interest_rate = Decimal(self.interest_rate) if self.interest_rate else Decimal(0)
        deposit_date = self.deposit_date
        maturity_date = self.maturity_date

        if deposit_date and maturity_date:
            tenure_days = (maturity_date - deposit_date).days
        else:
            tenure_days = 0

        # Ensure all arithmetic is done using Decimal
        days_in_year = Decimal(365)
        interest = amount * (interest_rate / Decimal(100)) * (Decimal(tenure_days) / days_in_year)
        interest = round(interest ,2)
        return interest

class JournalEntry(models.Model):
    date = models.DateField(default=timezone.now)  
    description = models.TextField()
    debit_account = models.ForeignKey('Account', on_delete=models.CASCADE, null=True, blank=True, related_name='debits')
    credit_account = models.ForeignKey('Account', on_delete=models.CASCADE, null=True, blank=True, related_name='credits')
    debit_amount = models.DecimalField(max_digits=10, decimal_places=2 , null=True, blank=True,)
    credit_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True,)
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, null=True, blank=True, related_name='journal_entries')
    banking_app = models.ForeignKey(BankingApp, on_delete=models.CASCADE, related_name='journal_entries')

    class Meta:
        verbose_name = 'Journal Entry'
        verbose_name_plural = 'Journal Entries'
        ordering = ['-date']

    def clean(self):
        if self.debit_amount and self.credit_amount and self.debit_amount != self.credit_amount:
            raise ValidationError("Debit and Credit amounts must be equal when both exist")
        
        if self.debit_account and self.credit_account and self.debit_account == self.credit_account:
            raise ValidationError("Debit and Credit accounts must be different when both exist")
        
        if not self.debit_account and not self.credit_account:
            raise ValidationError("At least one account (debit or credit) must be specified")

    def save(self, *args, **kwargs):
        
        if not self.transaction:
            self.clean()
            
          
            if self.debit_account and self.debit_amount:
                if self.debit_account.balance < self.debit_amount:
                    raise ValidationError(f"Insufficient balance in debit account {self.debit_account}")
                self.debit_account.balance -= self.debit_amount
                self.debit_account.save()

            if self.credit_account and self.credit_amount:
                self.credit_account.balance += self.credit_amount
                self.credit_account.save()

        super().save(*args, **kwargs)

class ContactRequest(models.Model):
    EMPLOYEES_CHOICES = [
        ('1-10', '1-10 employés'),
        ('11-50', '11-50 employés'),
        ('51-200', '51-200 employés'),
        ('201-1000', '201-1000 employés'),
        ('1000+', '1000+ employés'),
    ]

    first_name = models.CharField(max_length=100, verbose_name="Prénom")
    last_name = models.CharField(max_length=100, verbose_name="Nom")
    email = models.EmailField(verbose_name="Email professionnel")
    company = models.CharField(max_length=200, verbose_name="Entreprise")
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Téléphone")
    employees = models.CharField(
        max_length=20, 
        choices=EMPLOYEES_CHOICES, 
        blank=True, 
        null=True,
        verbose_name="Effectif"
    )
    message = models.TextField(verbose_name="Message")
    consent = models.BooleanField(default=False, verbose_name="Consentement RGPD")
    submitted_at = models.DateTimeField(default=timezone.now, verbose_name="Date de soumission")
    is_processed = models.BooleanField(default=False, verbose_name="Demande traitée")
    processed_at = models.DateTimeField(blank=True, null=True, verbose_name="Date de traitement")

    class Meta:
        verbose_name = "Demande de contact commercial"
        verbose_name_plural = "Demandes de contact commercial"
        ordering = ['-submitted_at']

    def __str__(self):
        return f"Demande de {self.first_name} {self.last_name} ({self.company})"