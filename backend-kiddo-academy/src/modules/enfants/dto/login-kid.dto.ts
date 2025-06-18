import { IsString, IsNotEmpty } from 'class-validator';

export class LoginEnfantDto {
  @IsString()
  @IsNotEmpty()
  kidsName: string;

  @IsString()
  @IsNotEmpty()
  codePin: string;

  @IsString()
  @IsNotEmpty()
  responsableId: string;
}
