// src/enseignant/dto/create-enseignant.dto.ts
import { IsString, IsNotEmpty, IsEmail, IsPhoneNumber, IsOptional, IsDateString, IsMongoId } from 'class-validator';

export class CreateEnseignantDto {
  // --- Données pour le compte utilisateur (table User) ---
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
  @IsOptional() // Assurez-vous que c'est optionnel si votre User schema le permet
  address?: string; // Correspond au champ 'address' dans le User schema

  @IsPhoneNumber('TN') // Spécifiez le code pays si vous utilisez un validateur de numéro de téléphone spécifique
  @IsOptional() // Assurez-vous que c'est optionnel si votre User schema le permet
  phoneNumber?: string; // Correspond au champ 'phoneNumber' dans le User schema

  // Si vous avez un 'userImage' pour l'utilisateur enseignant, ajoutez-le ici:
  // @IsString()
  // @IsOptional()
  // userImage?: string; 

  // --- Données pour le profil enseignant (table Enseignant) ---
  @IsString()
  @IsNotEmpty()
  numCin: string;

  @IsString()
  @IsNotEmpty()
  grade: string;

  @IsDateString() // Valide que la chaîne est un format de date valide
  @IsNotEmpty()
  dateDebutTravail: string; // Sera converti en Date côté NestJS

  @IsString()
  @IsOptional()
  specialty?: string; // Champ optionnel

  // L'ID de l'établissement auquel cet enseignant est rattaché
  // Il doit être un ID MongoDB valide et ne peut pas être vide.
  @IsMongoId() // Valide que la chaîne est un ObjectId MongoDB valide
  @IsNotEmpty()
  idResponsable: string; // L'ID MongoDB (string) de l'établissement (document User avec rôle 'etablissement')

  // Si vous avez un 'profileImage' spécifique à l'enseignant, ajoutez-le ici:
  // @IsString()
  // @IsOptional()
  // profileImage?: string; 
}