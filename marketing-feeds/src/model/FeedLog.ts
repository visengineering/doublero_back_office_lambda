export interface FeedLog {
  date: Date;
  name: string;
  items: number;
  data?: string;
  success: boolean;
  url: string;
  execution_time: string;
  error?: {
    name: string;
    message?: string;
    stack?: string;
  }
}
