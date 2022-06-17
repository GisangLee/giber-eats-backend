import got from "got";
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from "src/common/common.constants";
import { EmailVar, MailModuleOptions } from "./mail.interfaces";
import * as FormData from "form-data";

@Injectable()
export class MailService {
    constructor(
        @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions
    ){}

    private async sendEmail(
        subject: string,
        template: string,
        emailVars: EmailVar[],
        to?: string,
    ){
        const form = new FormData();

        form.append("from", `기버이츠 <postmaster@${this.options.domain}>`);
        form.append("to", to);
        form.append("subject", subject);
        form.append("template", template);
        emailVars.forEach(emailVar => form.append(`v:${emailVar.key}`, emailVar.value))

        try {
            await got(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
                method: "POST",
                headers: {
                    "Authorization": `Basic ${Buffer.from(`api:${this.options.apiKey}`).toString("base64")}`
                },
                body: form
            });

        } catch (error) {
            console.log(error)
        }
    }

    sendVerificationEmail(email:string, code:string) {
        this.sendEmail(
            "이메일 인증",
            "giber-eats-confirm-email",
            [
                {"key": "code", "value": code },
                {"key": "username", "value": email}
            ],
            "kisang6710@gmail.com"
        );
    }
}
