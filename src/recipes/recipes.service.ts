import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as sharp from 'sharp';
import { User } from 'src/auth/user.entity';
import { FilesService } from 'src/files/files.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { GetRecipesDto } from './dto/get-recipes.dto';
import { Recipe } from './recipe.entity';
import { RecipesRepository } from './recipes.repository';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(RecipesRepository)
    private recipesRepository: RecipesRepository,
    private readonly filesService: FilesService,
  ) {}

  async createRecipe(
    createRecipeDto: CreateRecipeDto,
    user: User,
  ): Promise<Recipe> {
    const recipe = this.recipesRepository.create({ ...createRecipeDto, user });
    const savedRecipe = await this.recipesRepository.save(recipe);

    return savedRecipe;
  }

  async getRecipes(user: User, getRecipesDto?: GetRecipesDto) {
    const query = this.recipesRepository.createQueryBuilder('recipe');

    query.leftJoinAndSelect('recipe.image', 'image');
    query.where({ user });
    if (getRecipesDto?.category) {
      query.andWhere('(recipe.category = :category)', {
        category: getRecipesDto.category,
      });
    }

    if (getRecipesDto?.search) {
      query.andWhere('(LOWER(recipe.title) LIKE LOWER(:search))', {
        search: `%${getRecipesDto.search}%`,
      });
    }

    if (getRecipesDto?.orderBy) {
      const orderBy = getRecipesDto.orderBy;
      const direction = orderBy === 'rating' ? 'DESC' : 'ASC';
      query.orderBy(`recipe.${orderBy}`, `${direction}`);
      query.addOrderBy('recipe.rating', 'DESC');
    } else {
      query.orderBy('recipe.title', 'ASC');
      query.addOrderBy('recipe.rating', 'DESC');
    }
    query.addOrderBy('recipe.title', 'ASC');

    const recipes = await query.getMany();

    return recipes;
  }

  async getById(id: string, user: User): Promise<Recipe> {
    const query = this.recipesRepository.createQueryBuilder('recipe');
    query.leftJoinAndSelect('recipe.image', 'image');
    query.where({ user });
    query.andWhere('(recipe.id = :id)', { id: id });
    query;
    const recipe = await query.getOne();
    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }
    return recipe;
  }

  async updateRecipe(
    id: string,
    updateRecipeDto: CreateRecipeDto,
    user: User,
  ): Promise<Recipe> {
    let recipe = await this.recipesRepository.findOne({
      where: { id, user },
    });
    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    // if (recipe.imageName !== updateRecipeDto.imageName) {
    //   fs.unlinkSync(`./uploads/recipeimages/${recipe.imageName}`);
    // }

    recipe = {
      ...recipe,
      ...updateRecipeDto,
    };
    const response = await this.recipesRepository.save(recipe);

    return response;
  }

  async deleteRecipe(id: string, user: User): Promise<void> {
    const result = await this.recipesRepository.delete({ id, user });
    if (result.affected === 0) {
      throw new NotFoundException('Recipe not found');
    }
  }

  async uploadImage(
    recipeId: string,
    user: User,
    imageBuffer: Buffer,
    filename: string,
  ) {
    const recipe = await this.getById(recipeId, user);

    if (recipe.image) {
      await this.recipesRepository.update(recipeId, { ...recipe, image: null });
      await this.filesService.deletePublicFile(recipe.image.id);
    }
    const resizedImageBuffer = await sharp(imageBuffer)
      .resize({
        width: 500,
        height: 500,
      })
      .jpeg()
      .toBuffer();

    const image = await this.filesService.uploadPublicFile(
      resizedImageBuffer,
      filename,
    );

    await this.recipesRepository.update(recipeId, {
      ...recipe,
      image,
    });
    return image;
  }

  async getImage(fileId: string) {
    const file = await this.filesService.getPublicFile(fileId);
    return file;
  }

  async deleteImage(recipeId: string, user: User) {
    const recipe = await this.getById(recipeId, user);
    const imageId = recipe.image?.id;
    if (imageId) {
      await this.recipesRepository.update(recipeId, { ...recipe, image: null });
      await this.filesService.deletePublicFile(imageId);
    }
  }
}
