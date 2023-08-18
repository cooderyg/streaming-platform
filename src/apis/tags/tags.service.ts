import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { In, Repository } from 'typeorm';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  /**
   * 태그 생성 시 태그들을 배열 형태로 출력합니다.
   * 태그가 존재하면 기존에 것을 쓰고, 없으면 생성합니다.
   * 기존 태그는 updatedAt을 최신화합니다.
   * 이는 현재 날짜와 비교해서 사용되지 않는 태그(유행지난 태그)를 구분하는데 활용됩니다.
   */
  async createTags({ createTagDto }: ITagsServiceCreateTag): Promise<Tag[]> {
    const tags = [];
    const { tagNames } = createTagDto;
    for (let i = 0; i < tagNames.length; i++) {
      const name = tagNames[i];
      let tag = await this.tagsRepository.findOneBy({ name }); // 태그가 있는지 확인
      if (!tag) {
        tag = await this.tagsRepository.save({ name }); // 없으면 생성
      } else {
        tag.updatedAt = new Date(); // 있으면 날짜 업데이트
        this.tagsRepository.save(tag);
      }
      tags.push(tag); // 태그 결과를 배열에 담기
    }
    return tags;
  }
}

interface ITagsServiceCreateTag {
  createTagDto: CreateTagDto;
}
