import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
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

  async getAll(user: User) {
    const query = this.recipesRepository.createQueryBuilder('recipe');

    query.where({ user });

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
}
