import { transporter } from "./sendMail.util.js";
import { Verification_Email_Template } from "./Emailtemplate.utils.js";

export const senderVerificationCode = async (to, verificationCode) => {
 
  try {

    const info = await transporter.sendMail({
      
      from: `"Live Quiz" <${process.env.MAIL_USER}>`,
      to,
      subject: "Verify your Email",
      text: `Your verification code is `,
      html: Verification_Email_Template.replace("{verificationCode}",verificationCode)
    });

    console.log("Email sent successfully for verification:");
    

  } catch (error) {
    console.log("Email error:", error);
    throw error; 
  }
};
