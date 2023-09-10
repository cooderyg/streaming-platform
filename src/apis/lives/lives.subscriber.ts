import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { Live } from './entities/live.entity';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Tag } from '../tags/entities/tag.entity';

@EventSubscriber()
export class Livesubscriber implements EntitySubscriberInterface {
  constructor(
    dataSource: DataSource,
    private readonly elasticsearchService: ElasticsearchService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Live;
  }

  afterInsert(event: InsertEvent<any>): void | Promise<any> {
    const live = event.entity;

    let tags: string = null;
    if (live.tags.length) {
      tags = live.tags.map((tag: Tag) => tag.name).join(',');
    }
    this.elasticsearchService.create({
      index: 'test7',
      id: live.id,
      document: {
        id: live.id,
        title: live.title,
        thumbnail_url: live.thumbnailUrl,
        replay_url: live.replayUrl,
        end_date: live.endDate,
        channel_id: live.channel.id,
        channel_name: live.channel.name,
        created_at: Math.floor(live.createdAt.getTime() / 1000),
        updated_at: Math.floor(live.updatedAt.getTime() / 1000),
        deleted_at: null,
        tags,
      },
    });
  }

  afterUpdate(event: UpdateEvent<any>): void | Promise<any> {
    const live = event.entity;
    let tags: string = null;
    if (live?.tags?.length) {
      tags = live.tags.map((tag: Tag) => tag.name).join(',');
    }
    this.elasticsearchService.update({
      index: 'test7',
      id: live.id,
      doc: {
        id: live.id,
        title: live.title,
        thumbnail_url: live.thumbnailUrl,
        replay_url: live.replayUrl,
        end_date: live.endDate,
        channel_id: live.channel.id,
        channel_name: live.channel.name,
        created_at: Math.floor(live.createdAt.getTime() / 1000),
        updated_at: Math.floor(live.updatedAt.getTime() / 1000),
        deleted_at: null,
        tags,
      },
    });
  }
}
