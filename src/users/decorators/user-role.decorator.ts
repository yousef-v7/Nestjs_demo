/* eslint-disable prettier/prettier */
import { SetMetadata } from '@nestjs/common';
import { UserType } from '../../utils/enum';

// Roles Method Decorator
export const Roles = (...roles: UserType[]) => SetMetadata('roles', roles);
