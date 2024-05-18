// IBlog
export interface IBlog {
  id?: number;
  title: string;
  content: string;
}

export type IBlogData = Partial<Omit<IBlog, "id">>;

// ISuccess
export interface IResponse {
  message: string;
  data?: any;
  success: boolean;
}
