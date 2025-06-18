import { Controller, Post, Get, Body, Param, Req, InternalServerErrorException, BadRequestException, UnauthorizedException, Logger, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { CreateEtablissementDto } from './dto/create-etablissement.dto';
import { LoginDto } from './dto/login.dto';
import { LoginEnfantDto } from '../enfants/dto/login-kid.dto';
import { CreateEnseignantDto } from '../enseignant/dto/create-enseignant.dto'; // DTO pour Enseignant (que nous avons créé)

import { AuthGuard } from './JWT/auth.guard';
import { AuthEnfantGuard } from './JWT/auth-child.guard';
import { RolesGuard } from './JWT/roles.guard';
import { Roles } from './JWT/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { error } from 'console';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name); // Instantiate the NestJS Logger

  constructor(private readonly userService: UserService) { }

  // Inscription d'un parent
  @Post('parent/register')
  async registerParent(@Body() createParentDto: CreateParentDto) {
    // Log the incoming data using the NestJS Logger
    this.logger.log(`Received data for parent registration: ${JSON.stringify(createParentDto)}`);
    try {
      const parent = await this.userService.createParent(createParentDto);
      this.logger.log(`Parent registered successfully with userId: ${parent.userId}`);
      return parent;
    } catch (error) {
      // Log the error using logger.error, including the stack for detailed debugging
      this.logger.error(`Error during parent registration: ${error.message}`, error.stack);
      // Re-throw specific NestJS exceptions or a generic InternalServerErrorException
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('An unexpected error occurred during parent registration.');
    }
  }

  // Inscription d'un établissement
  @Post('etablissement/register')
  async registerEtablissement(@Body() createEtablissementDto: CreateEtablissementDto) {
    this.logger.log(`Received data for establishment registration: ${JSON.stringify(createEtablissementDto)}`);
    try {
      const etablissement = await this.userService.createEtablissement(createEtablissementDto);
      this.logger.log(`Establishment registered successfully with userId: ${etablissement.userId}`);
      return etablissement;
    } catch (error) {
      this.logger.error(`Error during establishment registration: ${error.message}`, error.stack);
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('An unexpected error occurred during establishment registration.');
    }
  }

  // --- Nouvelle Route : Inscription d'un enseignant ---
  @Post('teacher/register')
  async registerEnseignant(@Body() createEnseignantDto: CreateEnseignantDto) {
    this.logger.log(`Received data for teacher registration: ${JSON.stringify(createEnseignantDto)}`);
    try {
      const enseignant = await this.userService.createEnseignant(createEnseignantDto);
      this.logger.log(`Teacher registered successfully with userId: ${enseignant.userId}`);
      return enseignant;
    } catch (error) {
      this.logger.error(`Error during teacher registration: ${error.message}`, error.stack);
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('An unexpected error occurred during teacher registration.');
    }
  }


  // Route de connexion
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const loginResponse = await this.userService.login(loginDto);

    // En fonction du rôle, rediriger vers une page spécifique
    if (loginResponse.role === 'parent') {
      // Si l'utilisateur est un parent
      return {
        message: 'Connexion réussie, redirige vers la page parent', token: loginResponse.token, userId: loginResponse.userId,
        role: loginResponse.role
      };
    } else if (loginResponse.role === 'etablissement') {
      // Si l'utilisateur est un établissement
      return {
        message: 'Connexion réussie, redirige vers la page établissement', token: loginResponse.token, userId: loginResponse.userId,
        role: loginResponse.role
      };
    } else if (loginResponse.role === 'admin') {
      // Si l'utilisateur est un admin
      return {
        message: 'Connexion réussie, redirige vers la page admin',
        token: loginResponse.token,
        userId: loginResponse.userId,
        role: loginResponse.role
      };
    }
    else if (loginResponse.role === 'teacher') { // <<< NOUVELLE CONDITION pour le rôle 'teacher'
      return {
        message: 'Connexion réussie, redirige vers la page admin',
        token: loginResponse.token,
        userId: loginResponse.userId,
        role: loginResponse.role
      };
    }

  }

  // ✅ Route protégée : récupérer les infos de l'utilisateur connecté
  @Get('me')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('parent', 'etablissement', 'admin', 'teacher')
  async getProfile(@Req() req) {
    const user = await this.userService.getUserById(req.user.userId);
    return user;
  }
  // ✅ Route protégée : accessible uniquement aux admins
  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async getAllUsers(@Req() req) {
    return this.userService.getAllUsers();
  }

  // Route protégée pour récupérer la liste des enfants de l'utilisateur connecté
  @Get('children')
  @UseGuards(AuthGuard)
  async getChildren(@Req() req) {
    const userId = req.user.userId;  // Récupère l'ID de l'utilisateur connecté depuis le token JWT
    const children = await this.userService.getChildrenByUserId(userId);
    return { children };
  }
  // controller
  @Post('loginKids')
  async loginEnfant(@Body() loginKidsDto: LoginEnfantDto) {
    return await this.userService.loginEnfant(loginKidsDto);
  }

  @UseGuards(AuthEnfantGuard)
  @Get('child-connected')
  getConnectedChild(@Req() req: Request & { enfant?: any }) {
    return this.userService.getConnectedChild(req.enfant.enfantId);
  }


}
