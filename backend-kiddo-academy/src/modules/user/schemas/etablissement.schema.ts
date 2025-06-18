

// import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
// import { User } from './user.schema';
// import { Document,Types } from 'mongoose';

// export type EtablissementDocument = Etablissement & Document;

// @Schema({ timestamps: true })
// export class Etablissement  {
//   @Prop({ type: Types.ObjectId, ref: 'User', required: true })
//   userId: Types.ObjectId;

//   @Prop()
//   url: string;
// }

// export const EtablissementSchema = SchemaFactory.createForClass(Etablissement);
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EtablissementDocument = Etablissement & Document;

@Schema({ timestamps: true })
export class Etablissement {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop()
  url: string;
}

export const EtablissementSchema = SchemaFactory.createForClass(Etablissement);
