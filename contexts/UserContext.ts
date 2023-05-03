import React, { createContext } from "react";

export interface IUserNotification {
  title: string;
  description: string;
  link?: string;
  unread?: boolean;
}

export interface IUserInfo {
  address: string;
  name?: string;
  pfpUrl?: string;
  tagline?: string;
  notifications?: IUserNotification[];
}

export interface IUserContext {
  userInfo: IUserInfo;
  setUserInfo: React.Dispatch<React.SetStateAction<IUserInfo>>;
}

export const UserContext = createContext({} as IUserContext);
