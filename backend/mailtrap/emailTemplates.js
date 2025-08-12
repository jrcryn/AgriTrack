export const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f7f9f9; padding: 20px; color: #333;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border: 1px solid #dcdcdc; border-radius: 8px;">
      <h2 style="color: #1e4d2b;">🎉 AgriTrack Account Created</h2>
      <p>Your AgriTrack account has been successfully created. Login here: <a href="https://agritrack.online/auth/login" style="color: #1e4d2b;" target="_blank">https://agritrack.online/auth/login</a></p>
      <p>Here are your login credentials:</p>
      <p><strong>Email: </strong>{email}</p>
      <p><strong>Password: </strong>{password}</p>
      <p style="margin-top: 10px;">Please log in and change your password immediately to ensure account security.</p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

      <p style="font-size: 13px; color: #555;">
        This is a system generated email, please do not reply.<br><br>
        If you encounter any issues or have questions, feel free to contact IT for support.<br>
        If you did not request this account or believe this message was sent to you by mistake, please contact us immediately at <a href="" style="color: #1e4d2b;">to be included</a>.
      </p>
    </div>
  </body>
</html>

`

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f7f9f9; padding: 20px; color: #333;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border: 1px solid #dcdcdc; border-radius: 8px;">
      <h2 style="color: #1e4d2b;">🔐 Password Reset Request</h2>
      <p>We have received a request to reset your password for your AgriTrack account.</p>
      <p>To proceed, click the button below:</p>
      <a href="{resetURL}" style="display: inline-block; background-color: #1e4d2b; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 5px; margin-top: 10px;">Reset Password</a>
      <p style="margin-top: 20px;">This link will expire after a set time for your security.</p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

      <p style="font-size: 13px; color: #555;">
        This is a system generated email, please do not reply.<br><br>
        If you encounter any issues or have questions, feel free to contact IT for support.<br>
        If you did not request this password reset or believe this message was sent to you by mistake, please contact us immediately at <a href="" style="color: #1e4d2b;">to be included</a>.
      </p>
    </div>
  </body>
</html>
`


export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f7f9f9; padding: 20px; color: #333;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border: 1px solid #dcdcdc; border-radius: 8px;">
      <h2 style="color: #1e4d2b;">✅ Password Successfully Reset</h2>
      <p>Your AgriTrack account password has been changed successfully.</p>
      <p><strong>For your security, we recommend:</strong></p>
      <ul>
        <li>Using a strong and unique password</li>
        <li>Enabling two-factor authentication, if available</li>
        <li>Not reusing passwords across multiple systems</li>
      </ul>
      <p style="font-weight: bold; color: red;">If this action was not done by you, contact IT immediately.</p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

      <p style="font-size: 13px; color: #555;">
        This is a system generated email, please do not reply.<br><br>
        If you encounter any issues or have questions, feel free to contact IT for support.<br>
        If you did not request this action or believe this message was sent to you by mistake, please contact us immediately at <a href="" style="color: #1e4d2b;">to be included</a>.
      </p>
    </div>
  </body>
</html>
`