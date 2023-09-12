# 🎇Freely B
## 🎖️Node.js 6기 챌린지 B팀
팀장 : 강영규 <br>
부팀장 : 류원희<br>
팀원 : 박민영, 김종현<br>

# 🎥 Freely B - 쉽고 자유로운 실시간 스트리밍 플랫폼


![Group 297420](https://github.com/cooderyg/streaming-platform/assets/122774009/fb109816-404a-4381-8d61-ec69f65cbe30)


# 📣프로젝트 소개
`Freely B`는 HLS 방식을 이용한 실시간 방송 스트리밍 서비스 입니다.

## 서비스 기획 배경
누구나 쉽고 자유롭게 방송할 수 있는 실시간 스트리밍 방송 플랫폼을 만들고자 하였습니다.<br>
📌서비스 바로가기 : https://freelyb.site <br>
📌서비스 이용 안내 : https://truthful-actor-498.notion.site/Freely-B-24175c3b86da4ccbba357adf11dc864d?pvs=4 <br>
<br>
# ⚙️서비스 아키텍쳐 소개
![Group 297420 (1)](https://github.com/cooderyg/streaming-platform/assets/122774009/c87082c1-2395-4a00-be13-565dc5fe2606)

## 사용한 기술
#### NestJS
- Express.js보다 구조화된 코드 작성에 유리하여 팀 단위 협업에 좋으며, 확장성이 좋다고 판단
#### MySQL
- 서비스 내 데이터들 간의 복잡한 관계를 관리하기 위해 관계형 데이터베이스 사용
#### MongoDB
- 동시 다발적으로 발생되는 채팅 데이터를 보다 빠르게 저장하기 위해 사용
#### RTMP
- 스트리머가 방송 설정을 하기 간편하고, 스트리머의 영상을 Node.js 서버에서 HLS방식으로 재가공하기에 가장 용이하다고 판단
#### FFmpeg
- RTMP로 전송받은 영상을 HLS방식으로 트랜스먹싱 하기 적합
#### HLS
- 레이턴시가 조금 길지만 webRTC 대비 다수의 연결에 훨씬 안정적으로 영상을 스트리밍 할 수 있음
#### Socket.IO
- 웹소켓 방식과 풀링 방식을 모두 지원하는 라이브러리로, 채팅기능 및  알림 구현 등을 위해 사용
#### Redis Cloud
- 대규모의 읽기 발생 시 지연시간을 줄이기 위해 사용
#### AWS S3
- 채널 이미지, 스트리밍 영상 및 m3u8 파일 업로드를 위해 사용
#### AWS Cloud Front
- S3에 업로드 된 데이터를 캐싱하여 빠르게 제공하기 위해 사용
#### Elastic Search
- 빠르고 정확한 검색 구현 및 검색어 자동완성 기능을 위해 사용

# 📐ERD 설계
![freelyb-erd](https://github.com/cooderyg/streaming-platform/assets/122774009/8d954128-252a-4172-bf24-ffead5ebdabe)

# 💡기술적 의사결정
## Cloud Front의 도입
## SSL 인증서 적용
## Elastic Search의 도입

#  🛠️트러블 슈팅
## 다수의 사용자가 메인 페이지 로딩 시 데이터 병목현상 발생
- 메인페이지에 대해서 간단한 부하테스트를 진행해 보았는데, 많지 않은 요청임에도 불구하고 응답이 급격히 느려지는 문제 발생
![Untitled (2)](https://github.com/cooderyg/streaming-platform/assets/122774009/bfc0fc35-d780-4a8f-9187-4e06010234b7)
- 데이터를 캐싱하여 요청 처리 속도를 높이면 해결되겠다 판단하여 Redis Cloud 연결 후 메인페이지 데이터 캐싱
  ![Untitled (3)](https://github.com/cooderyg/streaming-platform/assets/122774009/5e23d48e-ce93-4135-b8a8-820b2defdc9a)
## Cloud Front 캐싱 정책 관련 문제 발생
- S3에 업로드 되는 파일을 CloudFront에서 전부 캐싱하다 보니, 지속적으로 최신화되어야 할 index.m3u8 (ts파일 순서에 대한 파일) 파일 및 실시간 방송 썸네일이미지 파일마저 캐싱되어 스트리밍이 불가능한 상황이 발생하였습니다.
- AWS CloudFront 캐시 정책에서 /*.m3u8, /*.png에 대해서는 캐싱하지 않도록 정책을 수정하여 해결하였습니다.
![Untitled (4)](https://github.com/cooderyg/streaming-platform/assets/122774009/3edff0a4-14e6-47c6-baa1-efb9edcf7aec)
![Untitled (5)](https://github.com/cooderyg/streaming-platform/assets/122774009/4dd586d4-1ba4-4be5-805d-c4a37e001b76)
## 대규모 알림 발생 시 서버 블로킹 현상 발생
- Freely.B에서는 스트리머가 방송을 시작할 시 구독자들에게 알림메시지를 보내게 됩니다. 구독자가 적을 시에는 문제가 되지 않지만, 구독자 10000명의 테스트환경을 구성하여 테스트 해본 결과 알림 생성 시 약 ‘00’초가 소요되었고, 그 시간동안 서버가 블로킹상태가 되는 문제가 발생하였습니다.

