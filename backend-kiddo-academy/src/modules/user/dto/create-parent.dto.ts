// import { IsString, IsNotEmpty, IsEmail, IsPhoneNumber } from 'class-validator';

// export class CreateParentDto {
//   @IsEmail()
//   @IsNotEmpty()
//   email: string;

//   @IsString()
//   @IsNotEmpty()
//   password: string;

//   @IsString()
//   @IsNotEmpty()
//   username: string;

//   @IsPhoneNumber()
//   @IsNotEmpty()
//   phoneNumber: string;

//   @IsString()
//   @IsNotEmpty()
//   address: string;
// }
import { IsString, IsNotEmpty, IsEmail, IsPhoneNumber, IsDate, IsEnum, IsNumber } from 'class-validator';

export class CreateParentDto {
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

  @IsDate()
  @IsNotEmpty()
  dateNaissance: Date;

  @IsEnum(['Homme', 'Femme', 'Autre'])
  sexe: string;

  @IsNumber()
  @IsNotEmpty()
  kidsNumber: number;
}
