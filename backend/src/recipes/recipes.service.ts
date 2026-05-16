import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateRecipeDto, CreateRecipeProductDto, CreateRecipeStepDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeResponseDto } from './dto/recipe-response.dto';

@Injectable()
export class RecipesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Créer une nouvelle recette (sans ingrédients ni étapes)
   */
  async create(createRecipeDto: CreateRecipeDto): Promise<RecipeResponseDto> {
    // Vérifier que la maison existe
    const home = await this.prisma.home.findUnique({
      where: { id: createRecipeDto.homeId },
    });

    if (!home) {
      throw new NotFoundException(
        `Maison avec l'ID ${createRecipeDto.homeId} non trouvée`,
      );
    }

    // Créer la recette
    const recipe = await this.prisma.recipe.create({
      data: {
        homeId: createRecipeDto.homeId,
        name: createRecipeDto.name,
        picture: createRecipeDto.picture || '',
        description: createRecipeDto.description,
        recipeTags: createRecipeDto.tagIds
          ? {
              create: createRecipeDto.tagIds.map((tagId) => ({
                tagId,
              })),
            }
          : undefined,
      },
      include: {
        recipeProducts: {
          include: {
            product: true,
          },
        },
        recipeSteps: true,
        recipeTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return this.formatRecipeResponse(recipe);
  }

  /**
   * Récupérer toutes les recettes d'une maison
   */
  async findAll(homeId: number): Promise<RecipeResponseDto[]> {
    const recipes = await this.prisma.recipe.findMany({
      where: { homeId },
      include: {
        recipeProducts: {
          include: {
            product: true,
          },
        },
        recipeSteps: true,
        recipeTags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return recipes.map((recipe) => this.formatRecipeResponse(recipe));
  }

  /**
   * Récupérer une recette par son ID
   */
  async findOne(id: number): Promise<RecipeResponseDto> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: {
        recipeProducts: {
          include: {
            product: true,
          },
        },
        recipeSteps: true,
        recipeTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!recipe) {
      throw new NotFoundException(`Recette avec l'ID ${id} non trouvée`);
    }

    return this.formatRecipeResponse(recipe);
  }

  /**
   * Mettre à jour une recette
   */
  async update(
    id: number,
    updateRecipeDto: UpdateRecipeDto,
  ): Promise<RecipeResponseDto> {
    // Vérifier que la recette existe
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      throw new NotFoundException(`Recette avec l'ID ${id} non trouvée`);
    }

    const updateData: any = {};

    if (updateRecipeDto.name !== undefined) {
      updateData.name = updateRecipeDto.name;
    }

    if (updateRecipeDto.description !== undefined) {
      updateData.description = updateRecipeDto.description;
    }

    if (updateRecipeDto.picture !== undefined) {
      updateData.picture = updateRecipeDto.picture;
    }

    const updatedRecipe = await this.prisma.recipe.update({
      where: { id },
      data: updateData,
      include: {
        recipeProducts: {
          include: {
            product: true,
          },
        },
        recipeSteps: true,
        recipeTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Mettre à jour les tags si fournis
    if (updateRecipeDto.tagIds !== undefined) {
      // Supprimer les anciens tags
      await this.prisma.recipeRecipeTag.deleteMany({
        where: { recipeId: id },
      });

      // Créer les nouveaux tags
      if (updateRecipeDto.tagIds.length > 0) {
        await this.prisma.recipeRecipeTag.createMany({
          data: updateRecipeDto.tagIds.map((tagId) => ({
            recipeId: id,
            tagId,
          })),
        });
      }

      // Récupérer la recette mise à jour avec les nouveaux tags
      return this.findOne(id);
    }

    return this.formatRecipeResponse(updatedRecipe);
  }

  /**
   * Supprimer une recette
   */
  async remove(id: number): Promise<RecipeResponseDto> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      throw new NotFoundException(`Recette avec l'ID ${id} non trouvée`);
    }

    const deletedRecipe = await this.prisma.recipe.delete({
      where: { id },
      include: {
        recipeProducts: {
          include: {
            product: true,
          },
        },
        recipeSteps: true,
        recipeTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return this.formatRecipeResponse(deletedRecipe);
  }

  /**
   * Ajouter un ingrédient à une recette
   */
  async addIngredient(
    recipeId: number,
    createRecipeProductDto: CreateRecipeProductDto,
  ) {
    // Vérifier que la recette existe
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      throw new NotFoundException(
        `Recette avec l'ID ${recipeId} non trouvée`,
      );
    }

    // Vérifier que le produit existe
    const product = await this.prisma.product.findUnique({
      where: { id: createRecipeProductDto.productId },
    });

    if (!product) {
      throw new NotFoundException(
        `Produit avec l'ID ${createRecipeProductDto.productId} non trouvé`,
      );
    }

    // Vérifier que l'ingrédient n'existe pas déjà
    const existingIngredient = await this.prisma.recipeProduct.findUnique({
      where: {
        recipeId_productId: {
          recipeId,
          productId: createRecipeProductDto.productId,
        },
      },
    });

    if (existingIngredient) {
      throw new BadRequestException(
        `Cet ingrédient est déjà ajouté à la recette`,
      );
    }

    return await this.prisma.recipeProduct.create({
      data: {
        recipeId,
        productId: createRecipeProductDto.productId,
        quantityNeeded: createRecipeProductDto.quantityNeeded || null,
        multipliable: createRecipeProductDto.multipliable,
      },
      include: {
        product: true,
      },
    });
  }

  /**
   * Mettre à jour un ingrédient
   */
  async updateIngredient(
    recipeId: number,
    productId: number,
    data: Partial<CreateRecipeProductDto>,
  ) {
    // Vérifier que l'ingrédient existe
    const ingredient = await this.prisma.recipeProduct.findUnique({
      where: {
        recipeId_productId: {
          recipeId,
          productId,
        },
      },
    });

    if (!ingredient) {
      throw new NotFoundException(
        `Ingrédient non trouvé pour cette recette`,
      );
    }

    return await this.prisma.recipeProduct.update({
      where: {
        recipeId_productId: {
          recipeId,
          productId,
        },
      },
      data: {
        ...(data.quantityNeeded !== undefined && {
          quantityNeeded: data.quantityNeeded,
        }),
        ...(data.multipliable !== undefined && {
          multipliable: data.multipliable,
        }),
      },
      include: {
        product: true,
      },
    });
  }

  /**
   * Supprimer un ingrédient
   */
  async removeIngredient(recipeId: number, productId: number) {
    const ingredient = await this.prisma.recipeProduct.findUnique({
      where: {
        recipeId_productId: {
          recipeId,
          productId,
        },
      },
    });

    if (!ingredient) {
      throw new NotFoundException(
        `Ingrédient non trouvé pour cette recette`,
      );
    }

    return await this.prisma.recipeProduct.delete({
      where: {
        recipeId_productId: {
          recipeId,
          productId,
        },
      },
    });
  }

  /**
   * Ajouter une étape
   */
  async addStep(recipeId: number, createRecipeStepDto: CreateRecipeStepDto) {
    // Vérifier que la recette existe
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      throw new NotFoundException(
        `Recette avec l'ID ${recipeId} non trouvée`,
      );
    }

    // Vérifier que le numéro d'étape n'existe pas déjà
    const existingStep = await this.prisma.recipeStep.findUnique({
      where: {
        recipeId_stepNumber: {
          recipeId,
          stepNumber: createRecipeStepDto.stepNumber,
        },
      },
    });

    if (existingStep) {
      throw new BadRequestException(
        `Une étape avec le numéro ${createRecipeStepDto.stepNumber} existe déjà`,
      );
    }

    return await this.prisma.recipeStep.create({
      data: {
        recipeId,
        stepNumber: createRecipeStepDto.stepNumber,
        content: createRecipeStepDto.content,
      },
    });
  }

  /**
   * Mettre à jour une étape
   */
  async updateStep(
    recipeId: number,
    stepNumber: number,
    content: string,
  ) {
    const step = await this.prisma.recipeStep.findUnique({
      where: {
        recipeId_stepNumber: {
          recipeId,
          stepNumber,
        },
      },
    });

    if (!step) {
      throw new NotFoundException(
        `Étape ${stepNumber} non trouvée pour cette recette`,
      );
    }

    return await this.prisma.recipeStep.update({
      where: {
        recipeId_stepNumber: {
          recipeId,
          stepNumber,
        },
      },
      data: {
        content,
      },
    });
  }

  /**
   * Supprimer une étape
   */
  async removeStep(recipeId: number, stepNumber: number) {
    const step = await this.prisma.recipeStep.findUnique({
      where: {
        recipeId_stepNumber: {
          recipeId,
          stepNumber,
        },
      },
    });

    if (!step) {
      throw new NotFoundException(
        `Étape ${stepNumber} non trouvée pour cette recette`,
      );
    }

    return await this.prisma.recipeStep.delete({
      where: {
        recipeId_stepNumber: {
          recipeId,
          stepNumber,
        },
      },
    });
  }

  /**
   * Formater une recette pour la réponse
   */
  private formatRecipeResponse(recipe: any) {
    return {
      id: recipe.id,
      homeId: recipe.homeId,
      name: recipe.name,
      picture: recipe.picture,
      description: recipe.description,
      ingredients: recipe.recipeProducts.map((rp: any) => ({
        id: rp.id,
        recipeId: rp.recipeId,
        productId: rp.productId,
        productName: rp.product.name,
        quantityNeeded: rp.quantityNeeded,
        multipliable: rp.multipliable,
      })),
      steps: recipe.recipeSteps.map((rs: any) => ({
        id: rs.id,
        recipeId: rs.recipeId,
        stepNumber: rs.stepNumber,
        content: rs.content,
      })),
      tags: recipe.recipeTags.map((rt: any) => ({
        id: rt.tag.id,
        name: rt.tag.name,
      })),
      createdAt: recipe.createdAt.toISOString(),
      updatedAt: recipe.updatedAt.toISOString(),
    };
  }
}
