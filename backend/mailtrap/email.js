import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";
import { mailtrapClient, sender } from "./mailtrap.js";

const sendVerificationEmail = async (email, verificationCode) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify Your Email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationCode
      ),
      category: "Email Verification",
    });
    console.log("Email sent successfully", response);
  } catch (error) {
    console.log("Error in Sending email", error);
    throw new Error(`Error in sending verification email ${error}`);
  }
};

const sendWelcomeEmail = async (email, name) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      template_uuid: "59ce6b33-ae9c-4532-82f8-1ddad7470307",
      template_variables: {
        company_info_name: "STAR Industries",
        name: name,
      },
    });

    console.log("Welcome email sent successfully" , response)
  } catch (error) {
    console.log("Error in Sending Welcome email", error);
    throw new Error(`Error in sending Welcome email ${error}`);
  }
};

const sendPasswordResetEmail = async (email , resetURL) => {
  const recipient =  [{email}];

  try {
    const response = await mailtrapClient.send({
      from : sender,
      to : recipient,
      subject : "Reset Your Password",
      html : PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}" , resetURL),
      category : "Password Reset"
    })
  } catch (error) {
    console.log("Error in Reset Password Email" , error)
    throw new Error(`Error in sending password reset email : ${error}`)
  }
}

const sendResetSuccessEmail = async (email) => {
  const recipient = [{email}];
  try {
    const response = await mailtrapClient.send({
      from : sender,
      to : recipient,
      subject : "Password Reset Successfully",
      html : PASSWORD_RESET_SUCCESS_TEMPLATE,
      category : "Password Reset"
    })

    console.log("Password Reset Email sent Successfully" , response)
  } catch (error) {
    console.log("Error in sendResetSuccessEmail" , error)
    throw new Error(`Error password reset sending email : ${error}`)
  }
}

export { sendVerificationEmail, sendWelcomeEmail , sendPasswordResetEmail , sendResetSuccessEmail };
