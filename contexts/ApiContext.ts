import AppApi from "@utils/api";
import { createContext } from "react";


export interface IApiContext {
  api: AppApi;
}

export const ApiContext = createContext({} as IApiContext);
