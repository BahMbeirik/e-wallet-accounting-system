# Generated by Django 5.2.1 on 2025-05-26 11:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0007_alter_journalentry_options'),
    ]

    operations = [
        migrations.AlterField(
            model_name='transaction',
            name='transaction_type',
            field=models.CharField(choices=[('credit', 'Credit'), ('debit', 'Debit'), ('transfer', 'Transfer'), ('charging', 'Charging')], max_length=10),
        ),
    ]
