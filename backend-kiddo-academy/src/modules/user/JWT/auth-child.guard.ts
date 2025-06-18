import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthEnfantGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = request.headers['x-child-token'];

    if (!token) {
      throw new UnauthorizedException('Token enfant manquant');
    }

    try {
      const decoded = this.jwtService.verify(token, { secret: 'KiddoAcademy' });
      request.enfant = decoded; // Injection de l'enfant dans req
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token enfant invalide');
    }
  }
}
