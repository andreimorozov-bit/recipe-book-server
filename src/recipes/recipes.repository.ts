import { EntityRepository, Repository } from 'typeorm';
import { Recipe } from './recipe.entity';

@EntityRepository(Recipe)
export class RecipesRepository extends Repository<Recipe> {}
