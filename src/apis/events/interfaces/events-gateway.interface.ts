import { User } from 'src/apis/users/entities/user.entity';

export interface IEventsGatewayHandleChat {
  chat: string;
  user?: User;
}

export interface IEventsGatewayHandleDonation {
  roomId: string;
  amount: number;
  user?: User;
}
