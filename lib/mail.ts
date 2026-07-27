import fs from "fs/promises";
import Handlebars from "handlebars";
import path, {dirname} from "node:path";
import { fileURLToPath } from "node:url";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendMail = async ({
    to,
    subject,
    templateName,
    context,
}: {
    to: string;
    subject: string;
    templateName: string;
    context: object;
}) => {
    try {
        const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const templatesDir = path.resolve(__dirname, "../templates");
    const templatePath = path.join(templatesDir, templateName);
    const templateSource = await fs.readFile(templatePath, "utf-8");
    const html = Handlebars.compile(templateSource)(context);
    
    const { data, error } = await resend.emails.send({
      from: "My Event <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
        throw new Error(JSON.stringify(error));
    }

    console.log(`Email successfully sent to ${to}:`, data);
    }

    catch (error) {
        console.error("Failed to send email:", error);
        throw error;
    }
};