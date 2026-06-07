from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os, secrets, smtplib
from email.mime.text import MIMEText
from database import get_db
import auth as auth_utils
import models
import schemas

router = APIRouter(prefix="/auth", tags=["auth"])


def _send_email(to: str, subject: str, body: str):
    """Verstuurt een e-mail via Gmail SMTP. Vereist SMTP_USER en SMTP_PASS env vars."""
    host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    port = int(os.getenv("SMTP_PORT", "587"))
    user = os.getenv("SMTP_USER", "")
    pw   = os.getenv("SMTP_PASS", "")
    frm  = os.getenv("SMTP_FROM", user)
    if not user or not pw:
        raise RuntimeError("E-mail niet geconfigureerd (SMTP_USER / SMTP_PASS ontbreekt)")
    msg = MIMEText(body, "html", "utf-8")
    msg["Subject"] = subject
    msg["From"] = frm
    msg["To"] = to
    with smtplib.SMTP(host, port) as s:
        s.starttls()
        s.login(user, pw)
        s.sendmail(frm, [to], msg.as_string())


@router.post("/register", response_model=schemas.UserOut, status_code=201)
def register(data: schemas.UserRegister, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == data.email).first():
        raise HTTPException(status_code=400, detail="E-mailadres al in gebruik")

    user = models.User(
        email=data.email,
        name=data.name,
        password_hash=auth_utils.hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=schemas.Token)
def login(data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not auth_utils.verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Onjuist e-mailadres of wachtwoord")
    token = auth_utils.create_access_token(user.id)
    return {"access_token": token}


@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(auth_utils.get_current_user)):
    return current_user


@router.put("/change-password", status_code=204)
def change_password(
    data: schemas.ChangePassword,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    if not auth_utils.verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Huidig wachtwoord klopt niet")
    current_user.password_hash = auth_utils.hash_password(data.new_password)
    db.commit()
    return None


@router.post("/forgot-password", status_code=204)
def forgot_password(data: schemas.ForgotPassword, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user:
        return None  # geen info weggeven of e-mail bestaat
    # Verwijder eventuele oude tokens
    db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.user_id == user.id
    ).delete()
    token = secrets.token_hex(32)
    db.add(models.PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(hours=1),
    ))
    db.commit()
    app_url = os.getenv("APP_URL", "https://mise-en-place-weekmenu.netlify.app")
    reset_url = f"{app_url}/reset-wachtwoord?token={token}"
    try:
        _send_email(
            to=user.email,
            subject="Wachtwoord herstellen — Mise en Place",
            body=f"""
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
              <h2 style="color:#2F7D4F">Wachtwoord herstellen</h2>
              <p>Hoi {user.name},</p>
              <p>Klik op de knop hieronder om een nieuw wachtwoord in te stellen.
                 De link is geldig gedurende <strong>1 uur</strong>.</p>
              <a href="{reset_url}"
                 style="display:inline-block;margin:16px 0;padding:12px 24px;
                        background:#2F7D4F;color:#fff;border-radius:10px;
                        text-decoration:none;font-weight:700">
                Wachtwoord herstellen
              </a>
              <p style="color:#938A7C;font-size:13px">
                Als je dit niet hebt aangevraagd, kun je deze e-mail negeren.
              </p>
            </div>""",
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"E-mail versturen mislukt: {e}")
    return None


@router.post("/reset-password", status_code=204)
def reset_password(data: schemas.ResetPassword, db: Session = Depends(get_db)):
    record = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.token == data.token,
        models.PasswordResetToken.used == False,
        models.PasswordResetToken.expires_at > datetime.utcnow(),
    ).first()
    if not record:
        raise HTTPException(status_code=400, detail="Link is ongeldig of verlopen")
    record.used = True
    user = db.query(models.User).filter(models.User.id == record.user_id).first()
    user.password_hash = auth_utils.hash_password(data.new_password)
    db.commit()
    return None
