export const Verification_Email_Template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email — BrainBolt</title>
</head>
<body style="margin:0;padding:0;background:#eef2ff;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef2ff;padding:40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding-bottom:24px;">
                            <span style="font-size:28px;font-weight:900;letter-spacing:-0.5px;color:#1e1b4b;">Brain<span style="color:#6366f1;">Bolt</span> ⚡</span>
                        </td>
                    </tr>

                    <!-- Card -->
                    <tr>
                        <td style="background:#ffffff;border-radius:20px;overflow:hidden;border:1.5px solid #e0e7ff;box-shadow:0 4px 24px rgba(99,102,241,0.08);">

                            <!-- Top stripe -->
                            <tr>
                                <td height="5" style="background:linear-gradient(90deg,#6366f1,#a78bfa,#ec4899);font-size:0;line-height:0;">&nbsp;</td>
                            </tr>

                            <!-- Body -->
                            <tr>
                                <td style="padding:40px 48px 36px;">

                                    <!-- Icon -->
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td align="center" style="padding-bottom:28px;">
                                                <div style="width:64px;height:64px;background:#eef2ff;border-radius:50%;display:inline-block;text-align:center;line-height:64px;font-size:30px;">📬</div>
                                            </td>
                                        </tr>
                                    </table>

                                    <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#1e1b4b;text-align:center;">Verify your email address</p>
                                    <p style="margin:0 0 28px;font-size:14px;color:#6b7280;text-align:center;line-height:1.6;">Enter the code below to confirm your BrainBolt account.</p>

                                    <!-- Code box -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                                        <tr>
                                            <td align="center">
                                                <div style="display:inline-block;background:#eef2ff;border:1.5px solid #c7d2fe;border-radius:14px;padding:18px 40px;">
                                                    <span style="font-size:36px;font-weight:900;letter-spacing:10px;color:#6366f1;">{verificationCode}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>

                                    <p style="margin:0 0 6px;font-size:13px;color:#9ca3af;text-align:center;">This code expires in <strong style="color:#1e1b4b;">10 minutes</strong>.</p>
                                    <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">If you didn't create a BrainBolt account, you can safely ignore this email.</p>
                                </td>
                            </tr>

                            <!-- Divider -->
                            <tr>
                                <td style="padding:0 48px;">
                                    <div style="border-top:1px solid #f3f4f6;"></div>
                                </td>
                            </tr>

                            <!-- Footer inside card -->
                            <tr>
                                <td style="padding:20px 48px 32px;">
                                    <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                                        Need help? Email us at <a href="mailto:support@brainbolt.app" style="color:#6366f1;text-decoration:none;">support@brainbolt.app</a>
                                    </p>
                                </td>
                            </tr>
                        </td>
                    </tr>

                    <!-- Bottom footer -->
                    <tr>
                        <td align="center" style="padding:24px 0 0;">
                            <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} BrainBolt. All rights reserved.</p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;


export const Welcome_Email_Template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to BrainBolt</title>
</head>
<body style="margin:0;padding:0;background:#eef2ff;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef2ff;padding:40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding-bottom:24px;">
                            <span style="font-size:28px;font-weight:900;letter-spacing:-0.5px;color:#1e1b4b;">Brain<span style="color:#6366f1;">Bolt</span> ⚡</span>
                        </td>
                    </tr>

                    <!-- Card -->
                    <tr>
                        <td style="background:#ffffff;border-radius:20px;overflow:hidden;border:1.5px solid #e0e7ff;box-shadow:0 4px 24px rgba(99,102,241,0.08);">

                            <!-- Top stripe -->
                            <tr>
                                <td height="5" style="background:linear-gradient(90deg,#6366f1,#a78bfa,#ec4899);font-size:0;line-height:0;">&nbsp;</td>
                            </tr>

                            <!-- Hero -->
                            <tr>
                                <td style="background:#f5f3ff;padding:40px 48px 32px;text-align:center;border-bottom:1px solid #e0e7ff;">
                                    <div style="font-size:48px;margin-bottom:16px;">🎉</div>
                                    <p style="margin:0 0 8px;font-size:24px;font-weight:900;color:#1e1b4b;">Welcome aboard, {name}!</p>
                                    <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;">Your BrainBolt account is ready. Time to prove you're the smartest in the room.</p>
                                </td>
                            </tr>

                            <!-- Body -->
                            <tr>
                                <td style="padding:36px 48px 32px;">

                                    <p style="margin:0 0 20px;font-size:14px;color:#374151;font-weight:600;">Here's what you can do on BrainBolt:</p>

                                    <!-- Feature list -->
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td style="padding:12px 16px;background:#fafbff;border-radius:12px;border:1.5px solid #e0e7ff;margin-bottom:10px;">
                                                <table cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td style="font-size:22px;padding-right:14px;">⚡</td>
                                                        <td>
                                                            <p style="margin:0;font-size:14px;font-weight:700;color:#1e1b4b;">Join Live Quiz Battles</p>
                                                            <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Compete in real-time against other players across subjects.</p>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr><td height="10"></td></tr>
                                        <tr>
                                            <td style="padding:12px 16px;background:#fafbff;border-radius:12px;border:1.5px solid #e0e7ff;">
                                                <table cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td style="font-size:22px;padding-right:14px;">🏆</td>
                                                        <td>
                                                            <p style="margin:0;font-size:14px;font-weight:700;color:#1e1b4b;">Climb the Leaderboard</p>
                                                            <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Score high and fast to earn your spot at the top.</p>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr><td height="10"></td></tr>
                                        <tr>
                                            <td style="padding:12px 16px;background:#fafbff;border-radius:12px;border:1.5px solid #e0e7ff;">
                                                <table cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td style="font-size:22px;padding-right:14px;">🎯</td>
                                                        <td>
                                                            <p style="margin:0;font-size:14px;font-weight:700;color:#1e1b4b;">Track Your Accuracy</p>
                                                            <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Monitor your progress and improve with every attempt.</p>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- CTA -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                                        <tr>
                                            <td align="center">
                                                <a href="https://brainbolt.app/quiz" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:100px;letter-spacing:0.01em;">
                                                    Start Playing →
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Divider -->
                            <tr>
                                <td style="padding:0 48px;">
                                    <div style="border-top:1px solid #f3f4f6;"></div>
                                </td>
                            </tr>

                            <!-- Footer inside card -->
                            <tr>
                                <td style="padding:20px 48px 32px;">
                                    <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                                        Questions? Reach us at <a href="mailto:support@brainbolt.app" style="color:#6366f1;text-decoration:none;">support@brainbolt.app</a>
                                    </p>
                                </td>
                            </tr>
                        </td>
                    </tr>

                    <!-- Bottom footer -->
                    <tr>
                        <td align="center" style="padding:24px 0 0;">
                            <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} BrainBolt. All rights reserved.</p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;