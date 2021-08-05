import {
  Controller,
  Query,
  Get,
  Post,
  Param,
  Delete,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Res,
  Req,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuid } from 'uuid';
import { diskStorage, memoryStorage, Multer } from 'multer';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { Recipe } from './recipe.entity';
import { RecipesService } from './recipes.service';
import { GetRecipesDto } from './dto/get-recipes.dto';
import { ImageUpload } from 'src/common/ImageUpload';
import { join } from 'path';
import * as fs from 'fs';
import * as sharp from 'sharp';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get(':id')
  @UseGuards(AuthGuard())
  getById(@Param('id') id: string, @GetUser() user: User): Promise<Recipe> {
    return this.recipesService.getById(id, user);
  }

  @Get()
  @UseGuards(AuthGuard())
  getRecipes(
    @GetUser() user: User,
    @Query() getRecipesDto: GetRecipesDto,
  ): Promise<Recipe[]> {
    return this.recipesService.getRecipes(user, getRecipesDto);
  }

  @Post(':id/edit')
  @UseGuards(AuthGuard())
  updateRecipe(
    @Body() updateRecipeDto: CreateRecipeDto,
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<Recipe> {
    return this.recipesService.updateRecipe(id, updateRecipeDto, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  deleteRecipe(@Param('id') id: string, @GetUser() user: User): Promise<void> {
    return this.recipesService.deleteRecipe(id, user);
  }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createRecipeDto: CreateRecipeDto,
    @GetUser() user: User,
  ): Promise<Recipe> {
    return this.recipesService.createRecipe(createRecipeDto, user);
  }

  // @Post('upload')
  // @UseGuards(AuthGuard())
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     storage: diskStorage({
  //       destination: './uploads/recipeimages',
  //       filename: ImageUpload.customFileName,
  //     }),
  //   }),
  // )

  // async uploadFile(@UploadedFile() file: Express.Multer.File) {
  //   console.log(file);
  //   const newFilename = `${uuid()}.jpg`;
  //   const result = await sharp(file.path)
  //     .resize(500, 500)
  //     .jpeg({ quality: 90 })
  //     .toFile(`./uploads/recipeimages/${newFilename}`);

  //   fs.unlinkSync(file.path);
  //   return { newFilename };
  // }

  @Post('upload')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Body() body,
    @GetUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.recipesService.uploadImage(
      body.recipeId,
      user,
      file.buffer,
      file.originalname,
    );
  }

  @Get('images/:id')
  async getImage(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const file = await this.recipesService.getImage(id);
    file.stream.pipe(res);
  }
}
