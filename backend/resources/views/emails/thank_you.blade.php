<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: #2e7d32; color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .body { padding: 30px; color: #333; }
        .body p { line-height: 1.7; }
        .details { background: #f9f9f9; border-left: 4px solid #2e7d32; padding: 15px 20px; margin: 20px 0; border-radius: 4px; }
        .details table { width: 100%; border-collapse: collapse; }
        .details td { padding: 6px 0; font-size: 14px; }
        .details td:first-child { font-weight: bold; color: #555; width: 40%; }
        .footer { background: #f4f4f4; text-align: center; padding: 20px; font-size: 12px; color: #888; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌿 Thank You for Your Generosity!</h1>
        </div>
        <div class="body">
            <p>Dear <strong>{{ $donation->donor_name }}</strong>,</p>
            <p>
                We are deeply grateful for your kind donation to our campaign
                <strong>"{{ $donation->campaign->title }}"</strong>.
                Your contribution makes a real difference in the lives of those in need.
            </p>

            <div class="details">
                <table>
                    <tr>
                        <td>Campaign:</td>
                        <td>{{ $donation->campaign->title }}</td>
                    </tr>
                    <tr>
                        <td>Cloth Type:</td>
                        <td>{{ $donation->cloth_type }}</td>
                    </tr>
                    <tr>
                        <td>Quantity Received:</td>
                        <td>{{ $donation->verified_quantity }} items</td>
                    </tr>
                    <tr>
                        <td>Verified On:</td>
                        <td>{{ $donation->verified_at->format('d M Y') }}</td>
                    </tr>
                </table>
            </div>

            <p>
                Your donation has been verified and will be distributed to those who need it most.
                We truly appreciate your generosity and support for our mission.
            </p>
            <p>With warm regards,<br><strong>The Cloth Bank Team</strong></p>
        </div>
        <div class="footer">
            This is an automated email. Please do not reply to this message.
        </div>
    </div>
</body>
</html>
