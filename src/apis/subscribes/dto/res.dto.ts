export class ToggleSubscribeResDto {
  isSubscribed: boolean;
}

export class CheckSubscribeResDto extends ToggleSubscribeResDto {}

export class getSubscribeCountResDto {
  count: number;
}
