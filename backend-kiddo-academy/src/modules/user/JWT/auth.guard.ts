import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1]; // Extraire le token du header

    if (!token) {
      throw new Error('Token manquant');
    }

    try {
      const payload = this.jwtService.verify(token); // Vérifie le token
      request.user = payload; // Stocke les données de l'utilisateur dans la requête
      return true;
    } catch (error) {
      throw new Error('Token invalide');
    }
  }
}
