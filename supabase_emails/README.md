# Supabase Email Templates for Gigrilla

We have created 5 beautifully designed email templates for your Gigrilla project that perfectly match your brand colors (Dark Purple `#391D38` and Cerise `#EC008C`).

## How to use them

1. Go to your **Supabase Dashboard**
2. In your project, go to **Authentication** > **Email Templates**
3. Open each file from the `supabase_emails` directory in your code editor or browser.
4. Copy the entire HTML content.
5. In Supabase, clear whatever is inside the specific email type box.
6. Paste the HTML content into the **Message body** box.
7. Click **Save**

### Email Types mapping:

- **Confirm Signup**: Use `confirm-signup.html`
- **Invite User**: Use `invite-user.html`
- **Magic Link**: Use `magic-link.html`
- **Change Email Address**: Use `change-email.html`
- **Reset Password**: Use `reset-password.html`

> **Note:** The templates use Supabase template variables (e.g., `{{ .ConfirmationURL }}`, `{{ .SiteURL }}`). They are ready for production.
