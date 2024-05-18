import type { IResponse } from "../types";

export const setSuccessResponse = (msg: string, data: any): IResponse => ({
  success: true,
  message: msg,
  data: data,
});

export const setFailedResponse = (msg?: string): IResponse => ({
  success: false,
  message: msg || "Something went wrong",
  data: null,
});
