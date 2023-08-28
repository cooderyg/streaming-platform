import { User } from 'src/apis/users/entities/user.entity';

export interface IAlertsServiceGetAlerts {
  userId: string;
  page: number;
  size: number;
}

export interface IAlertsServiceCreateAlerts {
  users: User[];
  isOnAir: boolean;
  channelId: string;
  channelName: string;
  noticeContent?: string;
}

export interface IAlertsServiceReadAlert {
  alertId: string;
  userId: string;
}

export interface IAlertsServiceFindById {
  alertId: string;
}
