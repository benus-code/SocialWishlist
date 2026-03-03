import resend
from app.config import settings


def send_password_reset_email(to_email: str, reset_token: str) -> bool:
    if not settings.RESEND_API_KEY:
        print(f"[DEV] Password reset link: {settings.FRONTEND_URL}/reset-password?token={reset_token}")
        return True

    resend.api_key = settings.RESEND_API_KEY
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

    try:
        resend.Emails.send({
            "from": settings.RESEND_FROM_EMAIL,
            "to": [to_email],
            "subject": "Réinitialiser votre mot de passe - Wishly",
            "html": f"""
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 24px;">W</span>
                    </div>
                </div>
                <h2 style="text-align: center; color: #111827; margin-bottom: 16px;">Réinitialiser votre mot de passe</h2>
                <p style="color: #6b7280; text-align: center; margin-bottom: 24px;">
                    Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.
                </p>
                <div style="text-align: center; margin-bottom: 24px;">
                    <a href="{reset_url}" style="display: inline-block; padding: 12px 32px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 12px; font-weight: 600;">
                        Réinitialiser le mot de passe
                    </a>
                </div>
                <p style="color: #9ca3af; font-size: 14px; text-align: center;">
                    Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.
                </p>
            </div>
            """,
        })
        return True
    except Exception as e:
        print(f"Failed to send password reset email: {e}")
        return False
