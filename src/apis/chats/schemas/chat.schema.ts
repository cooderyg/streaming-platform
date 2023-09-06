import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CatDocument = HydratedDocument<Chat>;

@Schema()
export class Chat {
  @Prop({ required: true })
  liveId: string;

  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  nickname: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  createdAt?: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
