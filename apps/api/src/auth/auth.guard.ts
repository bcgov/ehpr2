import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
    @Inject(UserService)
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      return false;
    }

    const kcUser = await this.authService.getUserFromToken(token);
    let user = await this.userService.findUser(kcUser.id);
    if (!user) {
      user = await this.userService.createUser(kcUser);
    }
    request.user = user;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}