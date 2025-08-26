export enum AppState {
  IDLE,
  CAMERA_ACTIVE,
  ANALYZING,
  SHOWING_RESULT,
  ERROR,
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
}

export enum Occasion {
  PARTY = 'Party',
  FORMAL = 'Formal',
  CASUAL = 'Casual',
  TRENDING = 'Trending',
}

export interface RecommendedItem {
  itemName: string;
  category: string;
  reason: string;
}

export interface AnalysisResult {
  styleAnalysis: string;
  recommendations: RecommendedItem[];
}