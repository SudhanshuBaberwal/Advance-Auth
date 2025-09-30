import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";
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

export { sendVerificationEmail, sendWelcomeEmail };
