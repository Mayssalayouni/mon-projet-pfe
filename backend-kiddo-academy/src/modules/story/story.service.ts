// src/stories/story.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Story } from './schemas/story.schema';
import { CreateStoryDto } from './dto/create-story.dto';
import { User, UserDocument } from '../user/schemas/user.schema';
import { Enfant, EnfantDocument } from '../enfants/schemas/enfant.schemas';
import { Etablissement, EtablissementDocument } from '../user/schemas/etablissement.schema';
import { Enseignant, EnseignantDocument } from '../enseignant/schemas/enseignant.schema';
import { OpenAIService } from '../../openai/openai.service'; // Assurez-vous du chemin correct vers OpenAIService

@Injectable()
export class StoryService {
  constructor(
    @InjectModel(Story.name) private storyModel: Model<Story>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Enfant.name) private enfantModel: Model<EnfantDocument>,
    @InjectModel(Etablissement.name) private etablissementModel: Model<EtablissementDocument>,
    @InjectModel(Enseignant.name) private enseignantModel: Model<EnseignantDocument>,
    private readonly openAIService: OpenAIService // Injection du service OpenAI
  ) { }
  async create(createStoryDto: CreateStoryDto, userId: string): Promise<Story> {
    if (!userId || !Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID utilisateur invalide.');
    }

    const responsable = await this.userModel.findById(userId);
    if (!responsable) {
      throw new NotFoundException('Responsable (utilisateur) non trouvé.');
    }
    if (!responsable.role || typeof responsable.role !== 'string') {
      throw new BadRequestException('Le rôle de l\'utilisateur est manquant ou invalide.');
    }

    if (!Array.isArray(createStoryDto.paragraphs)) {
      throw new BadRequestException('Les paragraphes doivent être un tableau.');
    }
    for (const paragraph of createStoryDto.paragraphs) {
      if (typeof paragraph !== 'object' || !paragraph.text) {
        throw new BadRequestException('Chaque paragraphe doit être un objet contenant une propriété "text".');
      }
    }

    // --- Logic to generate title if needed ---
    if (!createStoryDto.titleStory && createStoryDto.storyTopic) {
      // This is an example of generating a title based on the storyTopic
      // You would use your OpenAI service for this.
      // For now, let's simulate it.
      console.log('Generating title based on story topic:', createStoryDto.storyTopic);
      // Example: A simple AI call to generate a title
      // createStoryDto.titleStory = await this.openAIService.generateTitleFromTopic(createStoryDto.storyTopic);
      createStoryDto.titleStory = `The Adventures of ${createStoryDto.storyTopic}`; // Placeholder for AI-generated title
    }
    // --- End logic to generate title ---

    const storyToCreate = {
      ...createStoryDto, // This now includes `titleStory` if it was in the DTO or generated above
      responsableId: new Types.ObjectId(userId),
      userRole: responsable.role,
    };

    const createdStory = new this.storyModel(storyToCreate);
    return createdStory.save();
  }

  async findAll(): Promise<Story[]> {
    return this.storyModel.find().exec();
  }

  async findOne(id: string): Promise<Story> {
    const story = await this.storyModel.findById(id).exec();
    if (!story) {
      throw new NotFoundException(`L'histoire avec l'ID ${id} n'a pas été trouvée.`);
    }
    return story;
  }

  async update(id: string, updateStoryDto: any): Promise<Story> {
    const updatedStory = await this.storyModel.findByIdAndUpdate(id, updateStoryDto, { new: true }).exec();
    if (!updatedStory) {
      throw new NotFoundException(`L'histoire avec l'ID ${id} n'a pas été trouvée.`);
    }
    return updatedStory;
  }

  async delete(id: string): Promise<Story> {
    const deletedStory = await this.storyModel.findByIdAndDelete(id).exec();
    if (!deletedStory) {
      throw new NotFoundException(`L'histoire avec l'ID ${id} n'a pas été trouvée.`);
    }
    return deletedStory;
  }

  async getStoriesForChildsEtablissement(enfantId: string): Promise<Story[]> {
    console.log(`[StoryService] Starting story retrieval for enfantId: ${enfantId}`);

    if (!Types.ObjectId.isValid(enfantId)) {
      console.error(`[StoryService] Invalid Enfant ID format provided: ${enfantId}`);
      throw new BadRequestException('Invalid child ID format.');
    }

    // 1. Find the Enfant document
    const child = await this.enfantModel.findById(enfantId).exec();
    console.log('enfantIdStories :', enfantId);

    if (!child) {
      console.error(`[StoryService] Enfant not found for ID: ${enfantId}`);
      throw new NotFoundException(`Child with ID ${enfantId} not found.`);
    }
    console.log(`[StoryService] Found child: ${child.kidsName}, responsableId: ${child.responsableId}, roleResponsable: ${child.roleResponsable}, level: ${child.level}`);

    // Get the child's level
    const childLevel = child.level;
    if (childLevel === undefined || childLevel === null) {
      console.error(`[StoryService] Child with ID ${enfantId} does not have a defined 'level'.`);
      throw new BadRequestException(`Child with ID ${enfantId} does not have a defined grade level.`);
    }

    let targetEtablissementUserObjectId: Types.ObjectId; // This is the _id of the User document that IS the establishment

    // 2. Determine the Establishment's User ID based on the child's responsible
    if (child.roleResponsable === 'etablissement') {
      // If the child's responsable is directly an 'etablissement' user
      targetEtablissementUserObjectId = child.responsableId;
      console.log(`[StoryService] Child's responsable is directly an etablissement User ID: ${targetEtablissementUserObjectId}`);
    } else if (child.roleResponsable === 'parent') {
      // If the child's responsable is a 'parent' user
      const parentUser = await this.userModel.findById(child.responsableId).exec();
      if (!parentUser || parentUser.role !== 'parent') {
        console.error(`[StoryService] Parent user not found or invalid role for child's responsableId: ${child.responsableId}`);
        throw new NotFoundException(`Parent user for child ID ${enfantId} not found or has an invalid role.`);
      }
      console.log(`[StoryService] Child's responsable is a parent User ID: ${parentUser._id}`);

      // Now, use parentUser.etablissement (which is the Etablissement profile _id)
      // to find the Etablissement profile document, then get its userId.
      if (!parentUser.etablissement) {
        console.error(`[StoryService] Parent user ${parentUser._id} is not linked to an Etablissement profile.`);
        throw new NotFoundException(`The parent account for child ${enfantId} is not associated with an establishment.`);
      }

      const etablissementProfile = await this.etablissementModel.findById(parentUser.etablissement).exec();
      if (!etablissementProfile) {
        console.error(`[StoryService] Etablissement profile not found for ID: ${parentUser.etablissement} linked to parent ${parentUser._id}.`);
        throw new NotFoundException(`The establishment profile linked to parent ${parentUser._id} was not found.`);
      }
      targetEtablissementUserObjectId = etablissementProfile.userId; // This is the User ID of the establishment
      console.log(`[StoryService] Parent linked to Etablissement profile ${etablissementProfile._id}. Corresponding Etablissement User ID: ${targetEtablissementUserObjectId}`);

    } else {
      console.error(`[StoryService] Unsupported responsable role for child: ${child.roleResponsable}`);
      throw new BadRequestException(`Unsupported responsable role for child: ${child.roleResponsable}`);
    }

    // 3. Find all Enseignant (Teacher) profiles associated with this establishment's User ID
    // Enseignant.idResponsable points to the User ID of the establishment.
    const teachers = await this.enseignantModel.find({
      idResponsable: new Types.ObjectId(child.responsableId), // <-- Corrected
    }).select('userId').exec(); // Get only the userId (which is the teacher's User ID)
    console.log(`[StoryService] Found ${teachers.length} teacher profiles for etablissement User ID: ${child.responsableId}`);

    if (teachers.length === 0) {
      console.log('[StoryService] No teacher profiles found for this establishment, returning empty story list.');
      return [];
    }


    const teacherUserIds = teachers.map(teacher => teacher.userId);
    console.log(`[StoryService] Teacher User IDs (story creators): ${teacherUserIds.map(id => id.toString())}`);

    // 4. Find all Stories created by these teachers AND filter by child's level
    // Story.responsableId refers to the User._id of the creator.
    const stories = await this.storyModel.find({
      responsableId: { $in: teacherUserIds }, // Where Story's creator's User ID is one of the found teacher User IDs
      userRole: 'teacher', // Ensure the story was created by a teacher
      gradeLevel: childLevel, // NEW: Filter stories by the child's level
    }).exec();

    console.log(`[StoryService] Found ${stories.length} stories relevant to enfantId: ${enfantId} and gradeLevel: ${childLevel}.`);
    return stories;
  }
  // Existing method for generating images for multiple paragraphs and a poster
  async generateForStory(paragraphs: string[], storyTitle: string) {
    const imagePaths: string[] = [];

    // Ensure paragraphs is an array before iterating
    if (!Array.isArray(paragraphs)) {
      throw new Error('Expected paragraphs to be an array.');
    }

    for (const paragraph of paragraphs) {
      const imagePath = await this.openAIService.generateImage(paragraph, 'images-generated');
      imagePaths.push(imagePath);
    }

    const posterPrompt = `Créer une affiche illustrant l’histoire intitulée "${storyTitle}", avec une ambiance captivante.`;
    const posterPath = await this.openAIService.generateImage(posterPrompt, 'posters');

    return {
      storyImages: imagePaths,
      poster: posterPath,
    };
  }

  // StoryService.ts
  async generateSingleImage(prompt: string): Promise<string> {
    // Le dossier dans lequel tu veux stocker les images (sous /uploads/posters)
    const imagePath = await this.openAIService.generateImage("A little bunny rabbit hopping in a green meadow", 'posters');
    return imagePath;
  }

}