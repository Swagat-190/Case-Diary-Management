# SendGrid Email Setup Guide

This guide will help you set up SendGrid for sending supervisor credentials via email.

## 1. Create a SendGrid Account

1. Go to [SendGrid](https://sendgrid.com) and sign up for a free account
2. Verify your email address
3. Complete the account setup process

## 2. Generate API Key

1. Log in to your SendGrid dashboard
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Give it a name like "Case-Diary-System"
5. Select **Full Access** for permissions
6. Click **Create & View**
7. **Copy the API key immediately** (you won't be able to see it again)

## 3. Configure Environment Variable

### Option 1: System Environment Variable
Set the environment variable on your system:
```
SENDGRID_API_KEY=your-actual-api-key-here
```

### Option 2: Application Properties (Not recommended for production)
You can also set it directly in `application.properties`:
```
sendgrid.api.key=your-actual-api-key-here
```

## 4. Verify Single Sender

1. In SendGrid dashboard, go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your details:
   - **From Email**: Use your actual email (e.g., yourname@gmail.com)
   - **From Name**: Case Diary System
   - **Reply To**: Same as From Email
4. Send the verification email and click the link

## 5. Update Application Properties

Update the `email.from` in `application.properties` to match your verified sender:
```
email.from=your-verified-email@example.com
email.from.name=Case Diary System
```

## 6. Test the Setup

1. Start your Spring Boot application
2. Log in as admin
3. Create a new supervisor account
4. Check your email for the credentials

## Free Tier Limits

- SendGrid free tier: 100 emails per day
- If you exceed this limit, you'll need to upgrade or use a different provider

## Troubleshooting

- **API Key Issues**: Make sure the API key is correct and has proper permissions
- **Sender Verification**: Ensure your sender email is verified in SendGrid
- **Environment Variable**: Check that the SENDGRID_API_KEY environment variable is set correctly
- **Logs**: Check application logs for detailed error messages

## Alternative Free Email Services

If SendGrid doesn't work for you, here are other free alternatives:

1. **Mailgun** (5,000 emails/month free)
2. **Postmark** (100 emails/month free)
3. **Amazon SES** (62,000 emails/month free, requires AWS account)

Each would require similar setup with API keys and sender verification.