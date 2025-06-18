// export class CreateEtablissementDto {
//     username: string;
//     email: string;
//     password: string;
//     name: string;
//     address: string;
//     contactEmail: string;
//   }
import { IsString, IsNotEmpty, IsEmail, IsPhoneNumber } from 'class-validator';

export class CreateEtablissementDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  address: string;

  @IsPhoneNumber()
  phoneNumber: string;

  @IsString()
  userImage: string;

  @IsString()
  url: string;
}
