import { IsString, IsInt, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateEnfantDto {
  @IsString()
  readonly kidsName: string;

  @IsInt()
  readonly age: number;

  @IsInt()
  readonly level: number;  

  @IsEnum(['Boy', 'Girl'])
  readonly sexe: string;

  @IsString()
  readonly codePin: string;

  @IsInt()
  readonly score: number;

  @IsMongoId()
  readonly responsableId: Types.ObjectId;

  @IsEnum(['parent', 'etablissement'])
  readonly roleResponsable: string;

  // Nouveau champ pour l'image
  @IsOptional()
  @IsString()
  readonly imageKids?: string; // Ce champ est optionnel
}
