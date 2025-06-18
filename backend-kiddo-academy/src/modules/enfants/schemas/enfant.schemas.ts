import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EnfantDocument = Enfant & Document;

@Schema({ timestamps: true })
export class Enfant {
  @Prop({ required: true , unique: true })
  kidsName: string;

  @Prop({ required: true })
  age: number;

  @Prop({ required: true })  
  level: number;
  
  @Prop({ required: true, enum: ['Boy', 'Girl'] })
  sexe: string;

  @Prop({ required: true, unique: true })
  codePin: string;

  @Prop({ default: 0 })  // Score par défaut = 0
  score: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })  // Lien avec le responsable
  responsableId: Types.ObjectId;

  @Prop({ enum: ['parent', 'etablissement'], required: true })  // Rôle du responsable
  roleResponsable: string;

  // Nouveau champ pour l'image
  @Prop({ type: String, required: false })  // Optionnel
  imageKids?: string;  // Optionnel pour stocker l'image
}

export const EnfantSchema = SchemaFactory.createForClass(Enfant);
