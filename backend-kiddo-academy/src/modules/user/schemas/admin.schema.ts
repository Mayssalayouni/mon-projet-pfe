import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AdminDocument = Admin & Document;

@Schema({ timestamps: true })
export class Admin {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  dateNaissance: Date;

  @Prop({ required: true, enum: ['Homme', 'Femme', 'Autre'] })
  sexe: string;

  @Prop({ required: true })
  kidsNumber: number;

  @Prop({ type: Array, default: [] })
  paiements: any[];
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
