export interface IAlertsServiceGetAlerts {
  userId: string;
  page: number;
  size: number;
}

export interface IAlertsServiceCreateAlerts {
  userIds: string[];
  isOnAir: boolean;
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
