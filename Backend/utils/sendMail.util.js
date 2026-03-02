import nodeMailer from "nodemailer"
import { Welcome_Email_Template } from "./Emailtemplate.utils.js";

export const transporter = nodeMailer.createTransport(
    {
        service:"gmail",
        auth:{
    user:process.env.MAIL_USER,
    pass:process.env.MAIL_PASS
}})

export  const verifyCode = async ( name,email)=>{
try{

    const info = await transporter.sendMail({
      from: `"Live Quiz" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "SignUp Sucesfull",
      text: `Welcome ${name}`,
      html: Welcome_Email_Template.replace("{name}",name)
    });

    console.log("Email sent succesfully for welcome:");
    

}catch(err){
    console.error("MAIL service error",err);
    
}
}


