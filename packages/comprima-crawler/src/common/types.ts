export interface Level {
  id: string;
  level: number;

  archivist: string;
  depositor: string;
  created: Date;

  attempts: number;
  crawled?: Date;
  error?: string | null;

  failed: number;
  successful: number;
}
