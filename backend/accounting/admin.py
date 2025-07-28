from django.contrib import admin
from .models import CustomUser ,Account , Transaction ,Loan ,Deposit ,JournalEntry
# Register your models here.


admin.site.register(Account)
admin.site.register(Transaction)
admin.site.register(Loan)
admin.site.register(Deposit)
admin.site.register(JournalEntry)