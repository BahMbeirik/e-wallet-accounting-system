from django_rest_passwordreset.signals import reset_password_token_created
from django.core.mail import EmailMultiAlternatives
from django.dispatch import receiver
from django.template.loader import render_to_string
from django.conf import settings

@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, **kwargs):
    reset_password_url = f"http://localhost:3000/reset-password-confirm?token={reset_password_token.key}"
    
    subject = "Réinitialisation du mot de passe-système de comptabilité"
    
    context = {
        'reset_password_url': reset_password_url,
        'user_name': reset_password_token.user.username,
    }
    
    text_content = render_to_string('email/password_reset.txt', context)
    html_content = render_to_string('email/password_reset.html', context)
    
    try:
        msg = EmailMultiAlternatives(
            subject,
            text_content,
            settings.EMAIL_HOST_USER, 
            [reset_password_token.user.email],
            reply_to=[settings.EMAIL_HOST_USER]
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        print(f"L'e-mail a été envoyé avec succès à {reset_password_token.user.email}")
    except Exception as e:
        print(f"Erreur de transmission: {str(e)}")
        raise e  # لإظهار الخطأ في الـ terminal