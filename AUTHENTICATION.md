# Authentication Features Documentation

This document outlines the new authentication features implemented for the application, including Social Login, CAPTCHA, Email Verification, and Password Recovery.

## Features

1.  **Social Login (Google)**: Users can sign up and login using their Google accounts.
2.  **Bot Prevention (CAPTCHA)**: Google reCAPTCHA v2 is integrated into the sign-up form to prevent bot registrations.
3.  **Email Verification**: New accounts are required to verify their email address before accessing full features.
4.  **Password Recovery**: Users can request a password reset link via email.

## Configuration

To enable these features, you need to configure the following environment variables in your `.env` files.

### Backend (`backend/.env`)

```env
# Email Configuration (Required for Verification & Password Reset)
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password

# Google OAuth (Required for Social Login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL (Used in email links)
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

Create a `.env` file in the `frontend` directory if it doesn't exist.

```env
# Google OAuth Client ID (Must match backend)
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Google reCAPTCHA Site Key
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
```

## How to Get Keys

1.  **Google OAuth**:
    *   Go to [Google Cloud Console](https://console.cloud.google.com/).
    *   Create a new project.
    *   Go to "APIs & Services" > "Credentials".
    *   Create "OAuth client ID".
    *   Application type: "Web application".
    *   Authorized JavaScript origins: `http://localhost:5173` (and your production URL).
    *   Authorized redirect URIs: `http://localhost:5173` (and your production URL).

2.  **Google reCAPTCHA**:
    *   Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin).
    *   Create a new site (v2 Checkbox).
    *   Add `localhost` and your production domain.
    *   Copy the "Site Key" to `VITE_RECAPTCHA_SITE_KEY`.

3.  **SMTP (Gmail)**:
    *   Enable 2-Step Verification on your Google Account.
    *   Go to "App passwords" (search in account settings).
    *   Create a new app password for "Mail".
    *   Use your email and this password in `SMTP_EMAIL` and `SMTP_PASSWORD`.

## Testing

*   **Social Login**: Will fail without a valid `VITE_GOOGLE_CLIENT_ID`.
*   **CAPTCHA**: Uses a test key by default (`6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`), which works on localhost but shows a warning. Replace with your own key for production.
*   **Email**: Emails will be logged to console if SMTP is not configured.
