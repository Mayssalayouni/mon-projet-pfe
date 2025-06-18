import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UserController } from '../user/user.controller';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Parent, ParentSchema } from '../user//schemas/parent.schema';
import { Etablissement, EtablissementSchema } from '../user/schemas/etablissement.schema';
import { Enfant, EnfantSchema } from './schemas/enfant.schemas';
import { EnfantService } from './enfant.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'enfant', schema: EnfantSchema },
    ]),
    JwtModule.register({
      secret: 'KiddoAcademy', 
      signOptions: { expiresIn: '1h' }, 
    }),
  ],
  providers: [EnfantService],
  controllers: [UserController],
})
export class UserModule {}
