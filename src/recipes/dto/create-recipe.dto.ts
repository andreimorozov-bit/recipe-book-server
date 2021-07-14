export type Unit =
  | 'gram'
  | 'pcs'
  | 'litre'
  | 'ml'
  | 'tbsp'
  | 'tsp'
  | 'can'
  | 'bottle'
  | 'oz'
  | 'lb'
  | '';

export class Ingredient {
  name: string;
  amount: number;
  unit: string;
}

export class CreateRecipeDto {
  title: string;
  description: string;
  ingredients: Ingredient[];
  category: string;
  rating: number;
  servings: number;
}
