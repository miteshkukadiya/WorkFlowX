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

## Render deployment

Render does not load the `.env` file from your computer. In the backend Web Service, open **Environment** and add these variables using the same Gmail sender account. Enter the `EMAIL_FROM` value without surrounding quotes; Render stores those quotes literally (unlike dotenv parsing):

- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=587`
- `SMTP_SECURE=false`
- `SMTP_USER` = sending Gmail address
- `SMTP_PASSWORD` = that account's Google App Password, without spaces
- `EMAIL_FROM=WorkFlowX <same-sending-address>`

Save the changes and redeploy the backend. Do not paste the App Password into chat or commit it to the repository.

If invitation creation still returns `503`, inspect the backend service logs at that time:

- `Email skipped: SMTP configuration is incomplete` means one or more variables are missing or incorrectly named.
- `Invitation email delivery failed` includes the SMTP failure reason. Authentication errors require checking the Gmail address and App Password. Connection timeouts indicate the deployed service cannot reach Gmail SMTP. If Render Free blocks outbound SMTP for the service, environment variables cannot bypass that restriction; keep SMTP and deploy the backend on a host/plan that permits outbound port 587.
