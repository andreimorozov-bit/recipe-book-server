import {
  Controller,
  Query,
  Get,
  Post,
  Param,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { Recipe } from './recipe.entity';
import { RecipesService } from './recipes.service';
import { GetRecipesDto } from './dto/get-recipes.dto';

@Controller('recipes')
@UseGuards(AuthGuard())
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get(':id')
  getById(@Param('id') id: string, @GetUser() user: User): Promise<Recipe> {
    return this.recipesService.getById(id, user);
  }

  @Get()
  getRecipes(
    @GetUser() user: User,
    @Query() getRecipesDto: GetRecipesDto,
  ): Promise<Recipe[]> {
    return this.recipesService.getRecipes(user, getRecipesDto);
  }

  @Post(':id/edit')
  updateRecipe(
    @Body() updateRecipeDto: CreateRecipeDto,
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<Recipe> {
    return this.recipesService.updateRecipe(id, updateRecipeDto, user);
  }

  @Delete(':id')
  deleteRecipe(@Param('id') id: string, @GetUser() user: User): Promise<void> {
    return this.recipesService.deleteRecipe(id, user);
  }

  @Post()
  create(
    @Body() createRecipeDto: CreateRecipeDto,
    @GetUser() user: User,
  ): Promise<Recipe> {
    return this.recipesService.createRecipe(createRecipeDto, user);
  }
}
