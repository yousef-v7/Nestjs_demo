/* eslint-disable prettier/prettier */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { JwtPayloadType } from '../utils/types';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserType } from '../utils/enum';
import { join } from 'node:path';
import { existsSync, unlinkSync } from 'node:fs';
import { AuthProvider } from './auth.provider';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly authProvider: AuthProvider,
  ) {}

  public async getCurrentUser(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  public getAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  public async update(id: number, updateUserDto: UpdateUserDto) {
    const { password, username } = updateUserDto;
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    user.userName = username ?? user.userName;
    if (password)
      user.password = await this.authProvider.hashPassword(password);

    return this.usersRepository.save(user);
  }

  public async delete(userId: number, payload: JwtPayloadType) {
    const user = await this.getCurrentUser(userId);
    if (
      user.id === payload?.id ||
      String(payload.userType) === String(UserType.ADMIN)
    ) {
      await this.usersRepository.remove(user);
      return { message: 'User has been deleted' };
    }
    throw new ForbiddenException('Access denied');
  }

  public async setProfileImage(userId: number, newProfileImage: string) {
    const user = await this.getCurrentUser(userId);

    if (user.profileImage !== null) {
      await this.removeProfileImage(userId);
    }

    user.profileImage = newProfileImage;
    return this.usersRepository.save(user);
  }

  public async removeProfileImage(userId: number) {
    const user = await this.getCurrentUser(userId);
    if (user.profileImage === null)
      throw new BadRequestException('No profile image to remove');

    const imagePath = join(
      process.cwd(),
      `./images/users/${user.profileImage}`,
    );
    if (existsSync(imagePath)) {
      unlinkSync(imagePath);
    }

    user.profileImage = null;
    return this.usersRepository.save(user);
  }

  // Returns the path to the user's profile image
  public getProfileImagePath(image: string): string {
    return join(process.cwd(), 'images', 'users', image);
  }

  public async verifyEmail(verificationToken: string) {
    const user = await this.usersRepository.findOne({
      where: { verificationToken },
    });

    if (!user)
      throw new NotFoundException('Invalid or expired verification token');

    user.isAccountVerified = true;
    user.verificationToken = null;

    await this.usersRepository.save(user);

    return {
      message: 'Your email has been verified, please log in to your account',
    };
  }

  /**
   * Sending reset password template
   * @param email email of the user
   * @returns a success message
   */
  public sendResetPassword(email: string) {
    return this.authProvider.sendResetPasswordLink(email);
  }

  /**
   * Get reset password link
   * @param userId user id from the link
   * @param resetPasswordToken reset password token from the link
   * @returns a success message
   */
  public getResetPassword(userId: number, resetPasswordToken: string) {
    return this.authProvider.getResetPasswordLink(userId, resetPasswordToken);
  }

  /**
   * Reset the password
   * @param dto data for reset the password
   * @returns a success message
   */
  public resetPassword(resetPasswordDto: ResetPasswordDto) {
    return this.authProvider.resetPassword(resetPasswordDto);
  }
}
