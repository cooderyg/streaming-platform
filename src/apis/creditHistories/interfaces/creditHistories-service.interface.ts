import { CreateCreditHistoryDto } from '../dto/create-credit-history.dto';

export interface ICreaditHistoriesServiceCreateCreditHistory {
  createCreditHistoryDto: CreateCreditHistoryDto;
  userId: string;
}

export interface ICreditHistoriesServiceFindCreditHistroyList {
  userId: string;
  page: number;
  size: number;
}

export interface ICreditHistoriesServiceFindCreditHistoryListByLive {
  liveId: string;
  userId: string;
}

export interface ICreaditHistoriesServiceFindByLiveId {
  liveId: string;
}

export interface ICreaditHistoriesServiceFindCreditHistoryByChannel {
  channelId: string;
}
