# 1. 운영체제 및 프로그램 설치 하나하나 입력하는 방식
# FROM ubuntu:22.04

# RUN sudo apt install nodejs
# RUN sudo npm install -g yarn

# 1. 운영체제 및 프로그램 설치(이미 리눅스, node, npm, yarn까지 모두 깔려있는 컴퓨터 다운로드 하는 방식)
FROM node:16
# 2. 내 컴퓨터에 있는 폴더나 파일을 도커 컴퓨터 안으로 복사하기
#RUN mkdir myfolder => 아래에서 COPY할 때, 폴더는 자동으로 생성이 된다. 굳이 실행시킬 필요 없음
COPY ./package.json /app/ 
COPY ./yarn.lock /app/
WORKDIR /app/
RUN yarn install
# RUN yarn global add pm2
COPY . /app/

# RUN yarn build
# 3. 도커 안에서 index.js 실행시키기
CMD yarn start:dev