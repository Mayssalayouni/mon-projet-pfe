// enfant.service.ts
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Enfant, EnfantDocument } from './schemas/enfant.schemas'
import { User, UserDocument } from '../user/schemas/user.schema'
import { CreateEnfantDto } from './dto/create-enfant.dto';
import { error } from 'console';
import { JwtService } from '@nestjs/jwt';
import { LoginEnfantDto } from '../enfants/dto/login-kid.dto';

@Injectable()
export class EnfantService {
  constructor(
    @InjectModel(Enfant.name) private enfantModel: Model<EnfantDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,

  ) {}

  async createEnfant(createEnfantDto: CreateEnfantDto, userId: string): Promise<Enfant> {
    const responsable = await this.userModel.findById(userId);
    if (!responsable) {
      throw new Error('Responsable non trouvé');  // Utilise une erreur standard
    }

    const newEnfant = new this.enfantModel({
      ...createEnfantDto,
      responsableId: userId,
      roleResponsable: responsable.role,
    });

    return await newEnfant.save();
  }

  async getEnfantsByResponsable(userId: string): Promise<Enfant[]> {
    return this.enfantModel.find({ responsableId: userId }).exec();
  }

  async getEnfantById(id: string): Promise<Enfant> {
    const enfant = await this.enfantModel.findById(id);
    if (!enfant) {
      throw new error('Enfant non trouvé');
    }
    return enfant;
  }
   async loginEnfant(loginKidsDto: LoginEnfantDto) {
       const { kidsName, codePin, responsableId } = loginKidsDto;
   
       const enfant = await this.enfantModel.findOne({ kidsName, codePin, responsableId });
   
       if (!enfant) {
         console.log('Enfant introuvable avec :', { kidsName, codePin, responsableId });
         throw new UnauthorizedException('Nom d’enfant ou code PIN incorrect.');
       }
   
       const payload = {
         enfantId: enfant._id,
         kidsName: enfant.kidsName,
         responsableId: enfant.responsableId.toString(),
   
       };
   
       const token = this.jwtService.sign(payload, { secret: 'KiddoAcademy', expiresIn: '1h' });
   
       console.log('Token:', token);
       console.log('enfantId:', enfant._id);
   
       return { token, enfant };
     }
   
   
     //
     // user.service.ts
   
     async getConnectedChild(enfantId: string) {
       const enfant = await this.enfantModel.findById(enfantId);
       console.log('enfantId :', enfantId);
   
       if (!enfant) {
         console.log('Payload du token:');
   
         throw new NotFoundException('Enfant non trouvé.');
       }
   
       return enfant;
     }
   
}
