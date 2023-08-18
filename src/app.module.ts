import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './apis/users/users.module';
import { AuthModule } from './apis/auth/auth.module';
import { CategoriesModule } from './apis/categories/cetegories.module';
import { ChannelsModule } from './apis/channels/channels.module';
import { LivesModule } from './apis/lives/lives.module';
import { TagsModule } from './apis/tags/tags.module';
import { PaymentsModule } from './apis/payments/payments.module';
import { SubscribesModule } from './apis/subscribes/subscribes.module';
import { CreditHistoriesModule } from './apis/creditHistories/credit-histories.module';
import { ViewHistoriesModule } from './apis/viewHistories/view-histories.module';
import { ChatsModule } from './apis/chats/chats.module';
import { InterestsModule } from './apis/interests/interests.module';
import { NoticesModule } from './apis/notices/notices.module';

@Module({
  imports: [
    AuthModule,
    CategoriesModule,
    ChannelsModule,
    ChatsModule,
    CreditHistoriesModule,
    InterestsModule,
    LivesModule,
    NoticesModule,
    TagsModule,
    PaymentsModule,
    UsersModule,
    ViewHistoriesModule,
    SubscribesModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_TYPE as 'mysql',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE,
      entities: [__dirname + '/apis/**/*.entity.*'],
      synchronize: true, // 개발환경에서만 사용
      logging: true,
      namingStrategy: new SnakeNamingStrategy(),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
