import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { Parent, ParentDocument } from './schemas/parent.schema';
import { Etablissement, EtablissementDocument } from './schemas/etablissement.schema';
import { Enfant, EnfantDocument } from '../enfants/schemas/enfant.schemas'

import { CreateParentDto } from './dto/create-parent.dto';
import { CreateEtablissementDto } from './dto/create-etablissement.dto';
import { Enseignant, EnseignantDocument } from '../enseignant/schemas/enseignant.schema'; // Assurez-vous du bon chemin
import { CreateEnseignantDto } from '../enseignant/dto/create-enseignant.dto'; // Vous devrez créer ce DTO

import { LoginDto } from './dto/login.dto';
import { LoginEnfantDto } from '../enfants/dto/login-kid.dto';
import { JwtService } from '@nestjs/jwt';
import { error } from 'console';
import e from 'express';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Parent.name) private parentModel: Model<ParentDocument>,
    @InjectModel(Etablissement.name) private etablissementModel: Model<EtablissementDocument>,
    @InjectModel(Enseignant.name) private enseignantModel: Model<EnseignantDocument>,
    @InjectModel(Enfant.name) private enfantModel: Model<EnfantDocument>,
    private jwtService: JwtService,
  ) { }



  async createParent(createParentDto: CreateParentDto): Promise<Parent> {
    const hashedPassword = await bcrypt.hash(createParentDto.password, 10);

    // Création de l'utilisateur
    const newUser = new this.userModel({
      email: createParentDto.email,
      password: hashedPassword,
      username: createParentDto.username,
      role: 'parent',
      address: createParentDto.address,
      phoneNumber: createParentDto.phoneNumber,
    });
    await newUser.save();

    // Création du Parent
    const newParent = new this.parentModel({
      userId: newUser._id,
      dateNaissance: createParentDto.dateNaissance,
      sexe: createParentDto.sexe,
      kidsNumber: createParentDto.kidsNumber,
    });
    await newParent.save();

    // Mise à jour du User avec l'ID du Parent
    await this.userModel.findByIdAndUpdate(newUser._id, { parent: newParent._id });

    return newParent;
  }

  // Inscription Établissement
  async createEtablissement(createEtablissementDto: CreateEtablissementDto): Promise<Etablissement> {
    const hashedPassword = await bcrypt.hash(createEtablissementDto.password, 10);

    // Création de l'utilisateur
    const newUser = new this.userModel({
      email: createEtablissementDto.email,
      password: hashedPassword,
      username: createEtablissementDto.username,
      role: 'etablissement',
      address: createEtablissementDto.address,
      phoneNumber: createEtablissementDto.phoneNumber,
      userImage: createEtablissementDto.userImage,
    });
    await newUser.save();

    // Création de l'Établissement
    const newEtablissement = new this.etablissementModel({
      userId: newUser._id,
      url: createEtablissementDto.url,
    });
    await newEtablissement.save();

    // Mise à jour du User avec l'ID de l'Établissement
    await this.userModel.findByIdAndUpdate(newUser._id, { etablissement: newEtablissement._id });

    return newEtablissement;
  }
  // Inscription Enseignant
  async createEnseignant(createEnseignantDto: CreateEnseignantDto): Promise<Enseignant> {
    const {
      email,
      password,
      username, // Du User DTO
      address,  // Du User DTO
      phoneNumber, // Du User DTO
      numCin,
      grade,
      dateDebutTravail,
      specialty,
      idResponsable
    } = createEnseignantDto;

    // 1. Vérifier si l'email ou l'username existe déjà
    const existingUser = await this.userModel.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      // Pour des raisons de sécurité, ne précisez pas si c'est l'email ou le username
      throw new BadRequestException('Un compte avec cet email ou username existe déjà.');
    }

    // 2. Vérifier si le CIN est déjà utilisé par un autre enseignant
    const existingEnseignantByCin = await this.enseignantModel.findOne({ numCin });
    if (existingEnseignantByCin) {
      throw new BadRequestException('Un enseignant avec ce numéro de CIN existe déjà.');
    }

    // 3. Vérifier si l'idResponsable est un établissement valide
    const etablissementUser = await this.userModel.findById(idResponsable);
    if (!etablissementUser || etablissementUser.role !== 'etablissement') {
      throw new BadRequestException('L\'ID de l\'établissement responsable n\'est pas valide.');
    }

    // 4. Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Création de l'utilisateur (compte de connexion)
    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      username,
      role: 'teacher', // Rôle défini pour l'enseignant
      address,
      phoneNumber,
      // userImage: createEnseignantDto.userImage, // Si vous voulez le passer depuis le DTO
    });
    await newUser.save();

    // 6. Création de l'Enseignant (profil professionnel)
    const newEnseignant = new this.enseignantModel({
      // firstName: createEnseignantDto.firstName, // Pas dans votre schéma Enseignant actuel
      // lastName: createEnseignantDto.lastName,   // Pas dans votre schéma Enseignant actuel
      numCin,
      grade,
      dateDebutTravail,
      specialty,
      idResponsable: new Types.ObjectId(idResponsable), // Assurez-vous que c'est un ObjectId
      // phoneNumber: createEnseignantDto.phoneNumber, // Si vous voulez le stocker aussi dans Enseignant
      // address: createEnseignantDto.address,         // Si vous voulez le stocker aussi dans Enseignant
      // profileImage: createEnseignantDto.profileImage, // Si vous voulez le stocker aussi dans Enseignant
      userId: newUser._id, // Lier l'enseignant au compte utilisateur que nous venons de créer
    });
    await newEnseignant.save();

    // 7. Mise à jour du User avec l'ID de l'Enseignant
    // Ceci crée le lien "teacher" dans le document User
    await this.userModel.findByIdAndUpdate(newUser._id, { teacher: newEnseignant._id });

    return newEnseignant; // Ou vous pouvez retourner un objet combiné si nécessaire
  }
  // Connexion utilisateur
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Vérifier si l'utilisateur existe
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Mot de passe incorrect');
    }
    // Générer un JWT
    const token = this.jwtService.sign({ userId: user._id, role: user.role });

    return {
      token,
      role: user.role,
      userId: user._id,
    };
  }
  //liste user 
  async getUserById(userId: string) {
    // Récupérer l'utilisateur avec ses données liées
    const user = await this.userModel
      .findById(userId)
      .populate('parent') // Charge les infos du parent
      .populate('etablissement')
      .populate('admin')// Charge les infos de l'établissement
      .lean();

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return user;
  }
  // Méthode pour récupérer tous les utilisateurs
  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  // Méthode pour récupérer les enfants de l'utilisateur connecté
  async getChildrenByUserId(userId: string): Promise<Enfant[]> {
    const children = await this.enfantModel.find({ responsableId: userId }).exec();
    if (!children) {
      throw new Error('Aucun enfant trouvé pour cet utilisateur');
    }
    return children;
  }

  async loginEnfant(loginKidsDto: LoginEnfantDto) {
    const { kidsName, codePin, responsableId } = loginKidsDto;

    const enfant = await this.enfantModel.findOne({ kidsName, codePin, responsableId });

    if (!enfant) {
      console.log('Enfant introuvable avec :', { kidsName, codePin, responsableId });
      throw new UnauthorizedException('Nom d’enfant ou code PIN incorrect.');
    }

    const payload = {
      enfantId: enfant._id,
      kidsName: enfant.kidsName,
      responsableId: enfant.responsableId.toString(),

    };

    const token = this.jwtService.sign(payload, { secret: 'KiddoAcademy', expiresIn: '1h' });

    console.log('Token:', token);
    console.log('enfantId:', enfant._id);

    return {
      token, enfant,
      enfantId: enfant._id
    };
  }


  async getConnectedChild(enfantId: string) {
    const enfant = await this.enfantModel.findById(enfantId);
    console.log('enfantId :', enfantId);

    if (!enfant) {
      console.log('Payload du token:');

      throw new Error('Enfant non trouvé.');
    }

    return enfant;
  }

}
