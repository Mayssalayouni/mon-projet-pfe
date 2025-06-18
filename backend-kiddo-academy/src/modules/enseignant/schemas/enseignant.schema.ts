// src/enseignant/schemas/enseignant.schema.ts (Moins recommandé sans firstName/lastName)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EnseignantDocument = Enseignant & Document;

@Schema({ timestamps: true })
export class Enseignant {
    // Suppression de firstName et lastName
    // Vous devrez vous fier au 'username' ou 'email' de la table User pour l'identification textuelle.
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true, unique: true })
    numCin: string; // Numéro de CIN

    @Prop({ required: true })
    grade: string; // Grade professionnel

    @Prop({ required: true })
    dateDebutTravail: Date; // Date d'embauche

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    idResponsable: Types.ObjectId; // Lien vers l'établissement

    // --- Champs optionnels supplémentaires ---
    @Prop()
    specialty?: string;

    @Prop()
    phoneNumber?: string;

    @Prop()
    address?: string;

    @Prop()
    profileImage?: string;
}

export const EnseignantSchema = SchemaFactory.createForClass(Enseignant);