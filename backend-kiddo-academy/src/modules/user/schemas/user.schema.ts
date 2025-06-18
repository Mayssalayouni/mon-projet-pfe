

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  username: string;

  @Prop({ enum: ['parent', 'etablissement', 'admin', 'teacher'], required: true })
  role: string;

  @Prop()
  address: string;

  @Prop()
  phoneNumber: string;

  @Prop({ required: false })
  userImage: string;

  @Prop({ type: Types.ObjectId, ref: 'Parent', default: null })
  parent: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Etablissement', default: null })
  etablissement: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Admin', default: null })
  admin: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Enseignant', default: null })
  teacher?: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
