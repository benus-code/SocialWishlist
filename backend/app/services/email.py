import httpx
from app.config import settings

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def send_password_reset_email(to_email: str, reset_token: str) -> bool:
    if not settings.BREVO_API_KEY:
        print(f"[DEV] Password reset link: {settings.FRONTEND_URL}/reset-password?token={reset_token}")
        return True

    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

    payload = {
        "sender": {
            "name": "Wishly",
            "email": settings.BREVO_SENDER_EMAIL,
        },
        "to": [{"email": to_email}],
        "subject": "Réinitialiser votre mot de passe - Wishly",
        "htmlContent": f"""
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
    }

    try:
        response = httpx.post(
            BREVO_API_URL,
            headers={
                "api-key": settings.BREVO_API_KEY,
                "content-type": "application/json",
                "accept": "application/json",
            },
            json=payload,
        )
        response.raise_for_status()
        return True
    except Exception as e:
        print(f"Failed to send password reset email: {e}")
        return False
