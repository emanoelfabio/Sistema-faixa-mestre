
import { BeltColor, StudentCategory } from './types';

export const APP_NAME = "Faixa Mestre";

export const CATEGORIES = Object.values(StudentCategory);
export const BELT_COLORS = Object.values(BeltColor);

export const BELT_PROGRESSION_RULES = {
  [StudentCategory.KIDS]: [
    BeltColor.WHITE, BeltColor.GREY, BeltColor.YELLOW, BeltColor.ORANGE, BeltColor.GREEN
  ],
  [StudentCategory.JUVENILE]: [
    BeltColor.WHITE, BeltColor.BLUE, BeltColor.PURPLE
  ],
  [StudentCategory.ADULT]: [
    BeltColor.WHITE, BeltColor.BLUE, BeltColor.PURPLE, BeltColor.BROWN, BeltColor.BLACK
  ],
  [StudentCategory.MASTER]: [ // Typically starts at Black Belt
    BeltColor.BLACK 
  ],
};

// Simplified time in grade (in months) for demonstration
export const MIN_TIME_IN_GRADE: { [key in BeltColor]?: number } = {
  [BeltColor.WHITE]: 3, // For Kids to Grey, Adult to Blue
  [BeltColor.GREY]: 6,
  [BeltColor.YELLOW]: 6,
  [BeltColor.ORANGE]: 6,
  [BeltColor.GREEN]: 12, // To Blue (Juvenile)
  [BeltColor.BLUE]: 24, // To Purple
  [BeltColor.PURPLE]: 18, // To Brown
  [BeltColor.BROWN]: 12, // To Black
};

export const BELT_COLOR_CLASSES: { [key in BeltColor]: string } = {
  [BeltColor.WHITE]: 'bg-belt-white text-black border border-gray-300',
  [BeltColor.GREY]: 'bg-belt-grey text-white',
  [BeltColor.YELLOW]: 'bg-belt-yellow text-black',
  [BeltColor.ORANGE]: 'bg-belt-orange text-white',
  [BeltColor.GREEN]: 'bg-belt-green text-white',
  [BeltColor.BLUE]: 'bg-belt-blue text-white',
  [BeltColor.PURPLE]: 'bg-belt-purple text-white',
  [BeltColor.BROWN]: 'bg-belt-brown text-white',
  [BeltColor.BLACK]: 'bg-belt-black text-white border border-red-500', // Black belts often have a red bar
};

export const DEFAULT_PROFILE_IMAGE = 'https://picsum.photos/200';
export const GALLERY_PLACEHOLDER_IMAGE = 'https://picsum.photos/seed/{id}/300/200';
