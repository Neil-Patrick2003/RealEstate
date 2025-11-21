<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Contact Form Submission</title>
</head>
<body>
<h2>New Contact Form Submission</h2>

<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p><strong>From:</strong> {{ $name }} ({{ $email }})</p>
    <p><strong>Subject:</strong> {{ $subject }}</p>
    <p><strong>Message:</strong></p>
    <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #10b981;">
        {{ $messageContent }}
    </div>
</div>

<p style="color: #6b7280; font-size: 14px;">
    This email was sent from your website contact form.
</p>
</body>
</html>
