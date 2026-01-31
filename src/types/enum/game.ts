export enum GameTemplateType {
  MEMORY = 'memory',
  QUIZ = 'quiz',
  REACTION = 'reaction',
  TETRIS = 'tetris',
  PUZZLE = 'puzzle',
  CATCH = 'catch',
  WHACK = 'whack',
}

export enum GameDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum GameStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum GameSessionStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  EXPIRED = 'expired',
}
