import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Multer } from 'multer';
import { RecipesService } from './recipes.service';
import {
  CreateRecipeDto,
  CreateRecipeProductDto,
  CreateRecipeStepDto,
} from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeResponseDto } from './dto/recipe-response.dto';

@ApiTags('recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/uploads/recipes',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(
            new BadRequestException('Seules les images sont acceptées'),
            false,
          );
        } else {
          cb(null, true);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  @ApiOperation({ summary: 'Créer une nouvelle recette' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'La recette a été créée avec succès',
    type: RecipeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Maison non trouvée' })
  create(
    @Body() body: any,
    @UploadedFile() file?: Multer.File,
  ): Promise<RecipeResponseDto> {
    const createRecipeDto: CreateRecipeDto = {
      name: body.name,
      description: body.description,
      homeId: parseInt(body.homeId, 10),
      picture: file ? `/uploads/recipes/${file.filename}` : '',
    };
    return this.recipesService.create(createRecipeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les recettes d\'une maison' })
  @ApiQuery({
    name: 'homeId',
    required: true,
    description: 'ID de la maison',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des recettes',
    type: [RecipeResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Maison non trouvée' })
  findAll(
    @Query('homeId', ParseIntPipe) homeId: number,
  ): Promise<RecipeResponseDto[]> {
    return this.recipesService.findAll(homeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une recette par son ID' })
  @ApiParam({ name: 'id', description: 'ID de la recette' })
  @ApiResponse({
    status: 200,
    description: 'La recette demandée',
    type: RecipeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Recette non trouvée' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RecipeResponseDto> {
    return this.recipesService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/uploads/recipes',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(
            new BadRequestException('Seules les images sont acceptées'),
            false,
          );
        } else {
          cb(null, true);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  @ApiOperation({ summary: 'Mettre à jour une recette' })
  @ApiParam({ name: 'id', description: 'ID de la recette' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'La recette a été mise à jour',
    type: RecipeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Recette non trouvée' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRecipeDto: UpdateRecipeDto,
    @UploadedFile() file?: Multer.File,
  ): Promise<RecipeResponseDto> {
    if (file) {
      updateRecipeDto.picture = `/uploads/recipes/${file.filename}`;
    }
    return this.recipesService.update(id, updateRecipeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une recette' })
  @ApiParam({ name: 'id', description: 'ID de la recette' })
  @ApiResponse({
    status: 200,
    description: 'La recette a été supprimée',
    type: RecipeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Recette non trouvée' })
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RecipeResponseDto> {
    return this.recipesService.remove(id);
  }

  @Post(':recipeId/ingredients')
  @ApiOperation({ summary: 'Ajouter un ingrédient à une recette' })
  @ApiParam({ name: 'recipeId', description: 'ID de la recette' })
  @ApiResponse({
    status: 201,
    description: 'L\'ingrédient a été ajouté',
  })
  @ApiResponse({ status: 404, description: 'Recette ou produit non trouvé' })
  @ApiResponse({ status: 400, description: 'Ingrédient déjà présent' })
  addIngredient(
    @Param('recipeId', ParseIntPipe) recipeId: number,
    @Body() createRecipeProductDto: CreateRecipeProductDto,
  ) {
    return this.recipesService.addIngredient(
      recipeId,
      createRecipeProductDto,
    );
  }

  @Patch(':recipeId/ingredients/:productId')
  @ApiOperation({ summary: 'Mettre à jour un ingrédient' })
  @ApiParam({ name: 'recipeId', description: 'ID de la recette' })
  @ApiParam({ name: 'productId', description: 'ID du produit' })
  @ApiResponse({
    status: 200,
    description: 'L\'ingrédient a été mis à jour',
  })
  @ApiResponse({ status: 404, description: 'Ingrédient non trouvé' })
  updateIngredient(
    @Param('recipeId', ParseIntPipe) recipeId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() data: Partial<CreateRecipeProductDto>,
  ) {
    return this.recipesService.updateIngredient(recipeId, productId, data);
  }

  @Delete(':recipeId/ingredients/:productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un ingrédient' })
  @ApiParam({ name: 'recipeId', description: 'ID de la recette' })
  @ApiParam({ name: 'productId', description: 'ID du produit' })
  @ApiResponse({
    status: 200,
    description: 'L\'ingrédient a été supprimé',
  })
  @ApiResponse({ status: 404, description: 'Ingrédient non trouvé' })
  removeIngredient(
    @Param('recipeId', ParseIntPipe) recipeId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.recipesService.removeIngredient(recipeId, productId);
  }

  @Post(':recipeId/steps')
  @ApiOperation({ summary: 'Ajouter une étape à une recette' })
  @ApiParam({ name: 'recipeId', description: 'ID de la recette' })
  @ApiResponse({
    status: 201,
    description: 'L\'étape a été ajoutée',
  })
  @ApiResponse({ status: 404, description: 'Recette non trouvée' })
  @ApiResponse({ status: 400, description: 'Étape déjà présente' })
  addStep(
    @Param('recipeId', ParseIntPipe) recipeId: number,
    @Body() createRecipeStepDto: CreateRecipeStepDto,
  ) {
    return this.recipesService.addStep(recipeId, createRecipeStepDto);
  }

  @Patch(':recipeId/steps/:stepNumber')
  @ApiOperation({ summary: 'Mettre à jour une étape' })
  @ApiParam({ name: 'recipeId', description: 'ID de la recette' })
  @ApiParam({ name: 'stepNumber', description: 'Numéro de l\'étape' })
  @ApiResponse({
    status: 200,
    description: 'L\'étape a été mise à jour',
  })
  @ApiResponse({ status: 404, description: 'Étape non trouvée' })
  updateStep(
    @Param('recipeId', ParseIntPipe) recipeId: number,
    @Param('stepNumber', ParseIntPipe) stepNumber: number,
    @Body('content') content: string,
  ) {
    return this.recipesService.updateStep(recipeId, stepNumber, content);
  }

  @Delete(':recipeId/steps/:stepNumber')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une étape' })
  @ApiParam({ name: 'recipeId', description: 'ID de la recette' })
  @ApiParam({ name: 'stepNumber', description: 'Numéro de l\'étape' })
  @ApiResponse({
    status: 200,
    description: 'L\'étape a été supprimée',
  })
  @ApiResponse({ status: 404, description: 'Étape non trouvée' })
  removeStep(
    @Param('recipeId', ParseIntPipe) recipeId: number,
    @Param('stepNumber', ParseIntPipe) stepNumber: number,
  ) {
    return this.recipesService.removeStep(recipeId, stepNumber);
  }
}
