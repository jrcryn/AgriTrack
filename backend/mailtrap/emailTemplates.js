export const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to AgriTrack</title>
</head>
<body style="font-family: Arial, sans-serif;">
  <h1>Welcome to AgriTrack.</h1>
  <p>Hi there! Your account has been successfully created.</p>
  
  <p>Here are your login credentials:</p>
  <div style="background-color: #f0f7f0; padding: 10px; border-radius: 5px; margin-top: 10px;">
    <p><strong>Email: </strong>{email}</p>
    <p><strong>Default Password: </strong>{password}</p>
  </div>

  <p style="color: #d9534f; font-weight: bold;">For security reasons, you are required to change your password immediately after your first login.</p>
  <p>If you have any questions or issues logging in, contact IT .</p>

  <p style="font-style: italic; color: #666;">If you didn’t request this account or are not supposed to receive this email, please contact us immediately at <a href="mailto:casd.support@gmail.com">casd.support@gmail.com</a>.</p>
</body>
</html>
`