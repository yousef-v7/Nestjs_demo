# 🛠 Full-Stack Authentication API (NestJS)

Welcome to the backend of a full-stack authentication and user management system built using **NestJS**. This app handles user registration, login, email verification, and more.

---

## 📦 Tech Stack

* **Backend Framework**: NestJS
* **Database**: PostgreSQL
* **ORM**: TypeORM
* **Email Service**: Mailtrap (for development)
* **Authentication**: JWT (JSON Web Tokens)
* **Password Security**: Bcrypt

---

## 🚀 Features

* User **Registration** with password hashing
* **Login** with JWT token generation
* **Email Verification** using a unique token sent via email
* Login **notification emails** sent on each login
* Protection for routes requiring verified accounts

---

## 📁 Project Setup

### 🧰 Install Dependencies

```bash
npm install
```

### ▶️ Run Locally

```bash
# Start in development mode
npm run start:dev
```

---

## ✉️ Email Configuration (Development)

This app uses [Mailtrap](https://mailtrap.io/) to simulate sending emails (e.g., verification, login notifications).

### 🔐 Set up Mailtrap:

1. Sign up on [Mailtrap.io](https://mailtrap.io)
2. Create a new inbox
3. Copy SMTP credentials
4. Create a `.env` file in your root directory and add the following:

```env
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your_mailtrap_username_here
MAIL_PASS=your_mailtrap_password_here
MAIL_FROM="Your App <noreply@yourapp.com>"
```

> ⚠️ Do **NOT** commit your real `.env` or credentials to version control.

For collaboration, create a `.env.example` file:

```env
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your_username_here
MAIL_PASS=your_password_here
MAIL_FROM="App Name <noreply@app.com>"
```

---

## 📝 API Logic Summary

### 🔐 Register

* Route: `POST /auth/register`
* On successful registration:

  * User is stored with a hashed password
  * A verification token is generated
  * A verification email is sent via Mailtrap

### ✅ Verify Email

* Route: `GET /auth/verify?token=<verification_token>`
* Marks the user as verified

### 🔑 Login

* Route: `POST /auth/login`
* Verifies email and password
* If the account is not verified:

  * Resends verification email
* If verified:

  * Sends a **login notification email**
  * Returns a JWT access token

---

## 🛠 Deployment Notes

If you deploy this API (e.g., to Vercel), Mailtrap emails **will not be visible to users**, as emails are only sent to the developer's Mailtrap inbox.

For production, switch to a real email provider like:

* Gmail SMTP
* SendGrid
* Mailgun

---

## 📬 Live Email Access (Production)

If you want users to receive real emails, use production credentials like this:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_gmail@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM="Your App <your_gmail@gmail.com>"
```

> Ensure you use App Passwords if you're using Gmail.

---

## ✅ Example Requests

```http
# Register
POST /auth/register
{
  "email": "user@example.com",
  "password": "12345678",
  "username": "Yousef"
}

# Login
POST /auth/login
{
  "email": "user@example.com",
  "password": "12345678"
}
```

---

## 💡 Final Notes

* Mailtrap is great for development, but not visible to real users
* Keep your `.env` safe and **never push it** to GitHub
* All email logic (verification + notifications) is already implemented

---
