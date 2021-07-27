import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import { User } from 'src/auth/user.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { GetRecipesDto } from './dto/get-recipes.dto';
import { Recipe } from './recipe.entity';
import { RecipesRepository } from './recipes.repository';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(RecipesRepository)
    private recipesRepository: RecipesRepository,
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
    query.where({ user });
    query.andWhere('(recipe.id = :id)', { id: id });
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

    if (recipe.imageName !== updateRecipeDto.imageName) {
      fs.unlinkSync(`./uploads/recipeimages/${recipe.imageName}`);
    }

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
}
