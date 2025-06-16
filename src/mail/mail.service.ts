/* eslint-disable prettier/prettier */

import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   * Sends a log-in notification email to the user.
   * @param email - The email address of the user.
   * @throws RequestTimeoutException if the email fails to send.
   */
  public async sendLogInEmail(email: string) {
    try {
      const today = new Date();
      await this.mailerService.sendMail({
        to: email,
        from: '<no-reply@my-nestjs-app.com>',
        subject: 'Log In Notification',
        template: 'login', // 'login.ejs' template file
        context: { email, today }, // to use in ejs template
      });
    } catch (error: any) {
      console.error('Error sending email:', error);
      throw new RequestTimeoutException('Failed to send email');
    }
  }

  /**
   * Sending verify email template
   * @param email email of the registered user
   * @param link link with id of the user and verification token
   */
  public async sendVerifyEmailTemplate(email: string, link: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: '<no-reply@my-nestjs-app.com>',
        subject: 'Verify your account',
        template: 'verify-email',
        context: { link },
      });
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException();
    }
  }

  /**
   * Sending reset password template
   * @param email email of the user
   * @param resetPasswordLink link with id of the user and reset password token
   */
  public async sendResetPasswordTemplate(
    email: string,
    resetPasswordLink: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: '<no-reply@my-nestjs-app.com>',
        subject: 'Reset password',
        template: 'reset-password',
        context: { resetPasswordLink },
      });
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException();
    }
  }
}
