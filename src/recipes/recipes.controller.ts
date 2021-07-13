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

@Controller('recipes')
@UseGuards(AuthGuard())
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  create(
    @Body() createRecipeDto: CreateRecipeDto,
    @GetUser() user: User,
  ): Promise<Recipe> {
    return this.recipesService.createRecipe(createRecipeDto, user);
  }

  @Get(':id')
  getById(@Param('id') id: string, @GetUser() user: User): Promise<Recipe> {
    return this.recipesService.getById(id, user);
  }

  @Get()
  getAll(@GetUser() user: User): Promise<Recipe[]> {
    return this.recipesService.getAll(user);
  }
}
