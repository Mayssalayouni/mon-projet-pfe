import { Module } from '@nestjs/common';
import { ContentGeneratorController } from './content.controller';
import { ContentGeneratorService } from './content.service';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    JwtModule.register({
          secret: 'KiddoAcademy',
          signOptions: { expiresIn: '1h' },
        }),
  ], // ConfigModule.forFeature() si spécifique à ce module
  controllers: [ContentGeneratorController],
  providers: [ContentGeneratorService],
})
export class ContentGeneratorModule {}