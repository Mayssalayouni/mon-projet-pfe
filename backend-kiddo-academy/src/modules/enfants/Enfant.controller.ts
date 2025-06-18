import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { EnfantService } from './enfant.service';
import { CreateEnfantDto } from './dto/create-enfant.dto';
import { AuthGuard } from '../user/JWT/auth.guard';
import { AuthEnfantGuard } from '../user/JWT/auth-child.guard'
import { RolesGuard } from '../user/JWT/roles.guard';
import { LoginEnfantDto } from '../enfants/dto/login-kid.dto';

@Controller('enfants')
@UseGuards(AuthGuard) // Vérifie si l'utilisateur est connecté
export class EnfantController {
  constructor(private readonly enfantService: EnfantService) { }

  @Post('register')
  async createEnfant(@Body() createEnfantDto: CreateEnfantDto, @Req() req) {
    console.log('Utilisateur connecté:', req.user);  // ✅ Vérifie ce que contient req.user
    return await this.enfantService.createEnfant(createEnfantDto, req.user.userId);
  }

  @Get()
  async getEnfantsByResponsable(@Req() req) {
    return await this.enfantService.getEnfantsByResponsable(req.user.userId);
  }

  @Get(':id')
  async getEnfantById(@Param('id') id: string) {
    return await this.enfantService.getEnfantById(id);
  }

  // controller
  @Post('loginKids')
  async loginEnfant(@Body() loginKidsDto: LoginEnfantDto) {
    return await this.enfantService.loginEnfant(loginKidsDto);
  }

  @Get('child-connected')
  @UseGuards(AuthEnfantGuard)
  getConnectedChild(@Req() req: Request & { enfant?: any }) {
    return this.enfantService.getConnectedChild(req.enfant.enfantId);
  }

}
