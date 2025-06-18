import {
  Controller,
  UseGuards,
  Req,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { StoryService } from './story.service';
import { Story } from './schemas/story.schema';
import { CreateStoryDto } from './dto/create-story.dto';
import { AuthGuard } from '../user/JWT/auth.guard'; // For Admin/Parent
import { AuthEnfantGuard } from '../user/JWT/auth-child.guard'; // For Child
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

// --- Multer Storage Configuration ---
// Define storage for posters
const posterStorage = diskStorage({
  destination: (req, file, cb) => {
    // Ensure the path is robust, starting from the project root or a known base
    // Using process.cwd() is generally safer for dynamic paths in NestJS
    const uploadPath = path.join(process.cwd(), 'uploads', 'posters');

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

@Controller('stories')
@UseGuards(AuthGuard) // Apply AuthGuard globally for admin/parent routes by default
export class StoryController {
  constructor(private readonly storyService: StoryService) { }

   @Post()
  @UseInterceptors(FileInterceptor('poster', {
    storage: posterStorage,
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new BadRequestException('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 1024 * 1024 * 10, // 10MB limit
    },
  }))
  async create(
    @Body() createStoryDto: CreateStoryDto,
    @Req() req,
    @UploadedFile() posterFile?: Express.Multer.File,
  ): Promise<Story> {
    console.log('>>> StoryController: Request received to create story <<<');
    console.log('Utilisateur connecté:', req.user);

    // --- CRITICAL FIX: Manually parse the 'paragraphs' field ---
    if (typeof createStoryDto.paragraphs === 'string') {
      console.log('>>> StoryController: Paragraphs is a string. Attempting to parse...');
      try {
        createStoryDto.paragraphs = JSON.parse(createStoryDto.paragraphs as any);
        console.log('>>> StoryController: Successfully parsed paragraphs!');
      } catch (e) {
        console.error('>>> StoryController: ERROR during paragraphs JSON parsing:', e);
        throw new BadRequestException('Invalid JSON format for paragraphs field. Please ensure it\'s a valid JSON string.');
      }
    } else {
      console.log('>>> StoryController: Paragraphs is NOT a string. Current type:', typeof createStoryDto.paragraphs);
    }

    if (!Array.isArray(createStoryDto.paragraphs)) {
      console.warn('>>> StoryController: createStoryDto.paragraphs is not an array after processing. Setting to empty array.');
      createStoryDto.paragraphs = [];
    }

    // --- Log all fields from DTO for debugging ---
    console.log('>>> StoryController: createStoryDto content before service call:');
    console.log('storyTopic:', createStoryDto.storyTopic);
    console.log('titleStory:', createStoryDto.titleStory); // Log the new field
    console.log('complexityLevel:', createStoryDto.complexityLevel, typeof createStoryDto.complexityLevel);
    console.log('difficultyDegree:', createStoryDto.difficultyDegree);
    console.log('gradeLevel:', createStoryDto.gradeLevel, typeof createStoryDto.gradeLevel);
    console.log('unitNumber:', createStoryDto.unitNumber, typeof createStoryDto.unitNumber);
    console.log('lessonNumber:', createStoryDto.lessonNumber, typeof createStoryDto.lessonNumber);
    console.log('numberOfStoryParagraphs:', createStoryDto.numberOfStoryParagraphs, typeof createStoryDto.numberOfStoryParagraphs);
    console.log('numberOfQuizQuestions:', createStoryDto.numberOfQuizQuestions, typeof createStoryDto.numberOfQuizQuestions);
    console.log('paragraphs (first few):', createStoryDto.paragraphs?.slice(0, 2));
    console.log('poster:', createStoryDto.poster);


    if (posterFile) {
      createStoryDto.poster = `/uploads/posters/${posterFile.filename}`;
      console.log('Poster file received, path set to:', createStoryDto.poster);
    } else {
      createStoryDto.poster = undefined;
      console.log('No poster file uploaded.');
    }

    return this.storyService.create(createStoryDto, req.user.userId);
  }

  @Post('upload-poster')
  @UseInterceptors(FileInterceptor('poster', {
    storage: posterStorage,
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new BadRequestException('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 1024 * 1024 * 10,
    },
  }))
  async uploadPoster(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }
    // Return the publicly accessible URL
    return { posterUrl: `/uploads/posters/${file.filename}` };
  }

  @Get()
  findAll(): Promise<Story[]> {
    return this.storyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Story> {
    return this.storyService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateStoryDto: any): Promise<Story> {
    return this.storyService.update(id, updateStoryDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<Story> {
    return this.storyService.delete(id);
  }

@Get('by-child-establishment/:enfantId')
  async getStoriesByChildEstablishment(@Param('enfantId') enfantId: string) {
    console.log(`[StoryController] Received request for stories for child's establishment. Enfant ID: ${enfantId}`);
    try {
      // The service now handles fetching the child's level internally
      const stories = await this.storyService.getStoriesForChildsEtablissement(enfantId);
      return stories;
    } catch (error) {
      console.error(`[StoryController] Error fetching stories for child ${enfantId}:`, error.message);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An internal error occurred while retrieving stories.');
    }
  }

  @Post('generate-images')
  async generateImages(@Body() body: { paragraphs: string[]; title: string }) {
    console.log('Received request for batch image generation:', body);
    if (!Array.isArray(body.paragraphs)) {
      throw new BadRequestException('`paragraphs` must be an array of strings.');
    }
    return this.storyService.generateForStory(body.paragraphs, body.title);
  }

  @Post('generate-single-image')
  async generateSingleImage(@Body() body: { prompt: string }) {
    if (!body.prompt || typeof body.prompt !== 'string') {
      throw new BadRequestException('A valid `prompt` string is required.');
    }
    console.log('Received request for single image generation for prompt:', body.prompt);
    const imagePath = await this.storyService.generateSingleImage(body.prompt);
    return { imagePath };
  }
}