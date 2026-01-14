
export enum Difficulty {
  BASIC = 'Cơ bản',
  INTERMEDIATE = 'Trung cấp',
  ADVANCED = 'Nâng cao'
}

export enum BloomLevel {
  REMEMBER = 'Nhận biết',
  UNDERSTAND = 'Thông hiểu',
  APPLY = 'Vận dụng',
  ANALYZE_CREATE = 'Vận dụng cao'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'Trắc nghiệm',
  SPELLING = 'Chính tả',
  ESSAY = 'Tự luận',
  FILL_BLANKS = 'Điền từ',
  MATCHING = 'Nối từ',
  WORD_ORDER = 'Sắp xếp câu'
}

export interface Question {
  id: string;
  type: QuestionType;
  content: string;
  options?: string[]; 
  matchingLeft?: string[]; 
  matchingRight?: string[]; 
  correctAnswer: string;
  explanation: string;
  bloomLevel: BloomLevel;
  points?: number;
}

export interface ExamConfig {
  title: string;
  subject: string;
  topic: string;
  duration: number;
  difficulty: Difficulty;
  schoolName: string;
  teacherName?: string;
  department?: string;
  examCode: string;
  customRequirement: string;
  sections: {
    type: QuestionType;
    count: number;
    bloomLevels: BloomLevel[];
    pointsPerQuestion: number;
  }[];
}

export interface ExamPaper {
  id: string;
  config: ExamConfig;
  questions: Question[];
  createdAt: string;
  version?: string;
}

export interface LeaderboardEntry {
  playerName: string;
  score: number;
  time: string;
  topic: string;
}

export interface AppUpdate {
  version: string;
  changelog: string[];
  downloadUrl: string;
  hasUpdate: boolean;
}
