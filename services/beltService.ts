
import { Student, Belt, BeltColor, StudentCategory } from '../types';
import { BELT_PROGRESSION_RULES, MIN_TIME_IN_GRADE } from '../constants';
import { calculateAge } from '../utils/helpers';

// This is a simplified model. Real CBJJ rules are more complex.
export const isEligibleForPromotion = (student: Student): { eligible: boolean; nextBelt?: Belt; reason?: string } => {
  const age = calculateAge(student.dateOfBirth);
  const currentBeltColor = student.currentBelt.color;
  const currentStripes = student.currentBelt.stripes;
  
  const progressionPath = BELT_PROGRESSION_RULES[student.category];
  if (!progressionPath) return { eligible: false, reason: "Categoria não definida para progressão." };

  const currentBeltIndex = progressionPath.indexOf(currentBeltColor);
  if (currentBeltIndex === -1) return { eligible: false, reason: "Faixa atual não está no caminho de progressão." };

  // Time in current grade (simplified)
  let timeInGradeMonths = 0;
  if (student.lastPromotionDate) {
    const promotionDate = new Date(student.lastPromotionDate);
    const now = new Date();
    timeInGradeMonths = (now.getFullYear() - promotionDate.getFullYear()) * 12 + (now.getMonth() - promotionDate.getMonth());
  } else { // If no promotion date, assume from joinDate for first belt
    const joinDate = new Date(student.joinDate);
    const now = new Date();
    timeInGradeMonths = (now.getFullYear() - joinDate.getFullYear()) * 12 + (now.getMonth() - joinDate.getMonth());
  }


  // Kids belts: can earn up to 4 stripes
  if (student.category === StudentCategory.KIDS && currentStripes < 4) {
    const minTimeForStripe = (MIN_TIME_IN_GRADE[currentBeltColor] || 12) / 4; // Arbitrary division for stripes
     if (timeInGradeMonths >= minTimeForStripe * (currentStripes + 1)) { // Simplified: time for next stripe
       return { eligible: true, nextBelt: { color: currentBeltColor, stripes: currentStripes + 1 }, reason: `Elegível para ${currentStripes + 1} grau(s) na faixa ${currentBeltColor}.` };
     }
  }
  
  // Promotion to next belt color
  const minTimeRequired = MIN_TIME_IN_GRADE[currentBeltColor];
  if (minTimeRequired !== undefined && timeInGradeMonths < minTimeRequired) {
    return { eligible: false, reason: `Requer ${minTimeRequired} meses na faixa ${currentBeltColor}, possui ${timeInGradeMonths}.` };
  }

  // Age restrictions (simplified)
  if (student.category === StudentCategory.KIDS && age > 15 && currentBeltIndex < progressionPath.length -1) {
     // If kid is too old for current kids belt, might jump or switch path (complex logic not implemented here)
     // For now, let's assume they move to the next belt in the kids path if eligible, instructor should handle category change
  }
  if (student.category === StudentCategory.JUVENILE && currentBeltColor === BeltColor.WHITE && age < 16) {
    return { eligible: false, reason: `Juvenil precisa ter 16 anos para a faixa Azul.` };
  }
  if (student.category === StudentCategory.ADULT && currentBeltColor === BeltColor.WHITE && age < 18) {
    return { eligible: false, reason: `Adulto precisa ter 18 anos para a faixa Azul.` };
  }
  
  if (currentBeltIndex < progressionPath.length - 1) {
    const nextBeltColor = progressionPath[currentBeltIndex + 1];
    return { eligible: true, nextBelt: { color: nextBeltColor, stripes: 0 }, reason: `Elegível para a faixa ${nextBeltColor}.` };
  }

  // Black belt degrees (not implemented in detail)
  if (currentBeltColor === BeltColor.BLACK) {
    // Logic for black belt degrees (e.g., 3 years for 1st degree)
    // For simplicity, let's say a stripe every 3 years on black belt
    const minTimeForDegree = 36; // 3 years
    if (timeInGradeMonths >= minTimeForDegree * (currentStripes + 1)) {
       return { eligible: true, nextBelt: { color: BeltColor.BLACK, stripes: currentStripes + 1 }, reason: `Elegível para o ${currentStripes + 1}º grau na faixa Preta.`};
    }
  }

  return { eligible: false, reason: "Já está na faixa mais alta da progressão ou outros critérios não foram atendidos." };
};

export const getNextBelt = (student: Student): Belt | null => {
  const eligibility = isEligibleForPromotion(student);
  if (eligibility.eligible && eligibility.nextBelt) {
    return eligibility.nextBelt;
  }
  return null;
};
