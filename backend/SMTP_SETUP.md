# Gmail SMTP setup

1. Enable 2-Step Verification for the Google account that will send WorkFlowX emails.
2. Create a Google App Password. Do not use the account's normal password.
3. Copy `.env.example` to `.env` if needed, then set:
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `SMTP_SECURE=false` (STARTTLS is required)
   - `SMTP_USER` to the sending Gmail address
   - `SMTP_PASSWORD` to the App Password, without spaces
   - `EMAIL_FROM` to `WorkFlowX <same-sending-address>`
4. Restart the backend and run `npm run email:verify` from `backend/`.

Keep `.env` private and never commit or share the App Password. SMTP verification checks connection and authentication but does not send an email.
