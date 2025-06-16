/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayloadType } from '../utils/types';
import { MailService } from '../mail/mail.service';
import { randomBytes } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@Injectable()
export class AuthProvider {
  private readonly logger = new Logger(AuthProvider.name);

  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly config: ConfigService, // to read environment variables
  ) {}

  /**
   * Registers a new user and returns an access token.
   * @param registerDto - The registration data.
   * @returns An object containing the access token.
   */
  public async register(registerDto: RegisterDto) {
    const { email, password, username } = registerDto;

    const userFromDb = await this.usersRepository.findOne({ where: { email } });
    if (userFromDb) throw new BadRequestException('User already exists');

    const hashedPassword = await this.hashPassword(password);

    let newUser = this.usersRepository.create({
      email,
      userName: username,
      password: hashedPassword,
      verificationToken: randomBytes(32).toString('hex'),
    });

    newUser = await this.usersRepository.save(newUser);

    if (!newUser.verificationToken) {
      throw new Error('Verification token was not generated.');
    }

    const link = this.generateLink(newUser.verificationToken);

    // Send verification email
    await this.mailService.sendVerifyEmailTemplate(email, link);

    return {
      message: 'User registered successfully, please verify your email',
    };
  }

  /**
   * Logs in a user and returns an access token.
   * @param loginDto - The login data.
   * @returns An object containing the access token.
   */
  public async login(loginDto: LoginDto) {
  const { email, password } = loginDto;

  const user = await this.usersRepository.findOne({ where: { email } });
  if (!user) throw new BadRequestException('Invalid email or password');

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch)
    throw new BadRequestException('Invalid email or password');

  if (!user.isAccountVerified) {
    let verificationToken = user.verificationToken;

    if (!verificationToken) {
      user.verificationToken = randomBytes(32).toString('hex');
      const result = await this.usersRepository.save(user);
      verificationToken = result.verificationToken;
    }
    if (!verificationToken) {
      throw new BadRequestException('Verification token is missing.');
    }

    const link = this.generateLink(verificationToken);

    try {
      await this.mailService.sendVerifyEmailTemplate(user.email, link);
    } catch (err) {
      console.error('Failed to send verification email:', err.message);
    }

    return {
      message:
        'Your email is not verified. A verification link has been sent (if possible).',
    };
  }

  try {
    await this.mailService.sendLogInEmail(user.email);
  } catch (err) {
    console.error('Failed to send login email:', err.message);
  }

  const accessToken = await this.generateJWT({
    id: user.id,
    userType: user.userType,
  });

  return { accessToken };
}


  /**
   * Sending reset password link to the client
   */
  public async sendResetPasswordLink(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user)
      throw new BadRequestException('user with given email does not exist');

    user.resetPasswordToken = randomBytes(32).toString('hex');
    const result = await this.usersRepository.save(user);

    const resetPasswordLink = `${this.config.get<string>('CLIENT_DOMAIN')}/reset-password/${user.id}/${result.resetPasswordToken}`;

    await this.mailService.sendResetPasswordTemplate(email, resetPasswordLink);

    return {
      message:
        'Password reset link sent to your email, please check your inbox!',
    };
  }

  /**
   * Get reset password link
   */
  public async getResetPasswordLink(
    userId: number,
    resetPasswordToken: string,
  ) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('invalid link');

    if (
      user.resetPasswordToken === null ||
      user.resetPasswordToken !== resetPasswordToken
    )
      throw new BadRequestException('invalid link');

    return { message: 'valid link' };
  }

  /**
   * Resets the user's password.
   * @param resetPasswordDto - The data required to reset the password.
   * @returns A message indicating the password was reset successfully.
   */
  public async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { userId, resetPasswordToken, newPassword } = resetPasswordDto;

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('invalid link');

    if (
      user.resetPasswordToken === null ||
      user.resetPasswordToken !== resetPasswordToken
    )
      throw new BadRequestException('invalid link');

    const hashedPassword = await this.hashPassword(newPassword);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    await this.usersRepository.save(user);

    return { message: 'password reset successfully, please log in' };
  }

  //
  //
  /**
   * Generates a JWT token for the given payload.
   * @param payload - The payload to include in the JWT.
   * @returns A promise that resolves to the generated JWT token.
   */
  public generateJWT(payload: JwtPayloadType): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  /**
   * Hashes a password using bcrypt.
   * @param password - The password to hash.
   * @returns A promise that resolves to the hashed password.
   */
  public async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * @param verificationToken
   * @returns
   */
  private generateLink(verificationToken: string) {
    return `${this.config.get<string>('DOMAIN')}/api/users/verify-email/${verificationToken}`;
  }
}
