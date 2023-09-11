const { faker } = require('@faker-js/faker');
const fs = require('fs');

const signup = async (email, password, nickname) => {
  const response = await fetch('http://127.0.0.1:3000/api/users/dummy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      nickname,
    }),
  });
  const data = await response.json();
  return data;
};

const createLive = async (userId, title, tagNames) => {
  const response = await fetch('http://127.0.0.1:3000/api/lives/dummy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      title,
      tagNames,
    }),
  });
};

const subscribe = async (userId, channelId) => {
  const response = await fetch('http://127.0.0.1:3000/api/subscribes/dummy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      channelId,
    }),
  });
  return response;
};

const jsonFile = fs.readFileSync('./twitch_data.json', 'utf8');
let jsonData = JSON.parse(jsonFile); // 더미 655개
const dummyCount = 1000;
let progress;
const jsonDataLength = jsonData.length;
// check?
// console.log(jsonData);

// slice?
// jsonData = jsonData.slice(0, 1);

// 트위치 데이터로 유저 생성 및 구독
async function makeDummies() {
  let j = 1;
  for (let i = 0; i < Math.ceil(dummyCount / jsonDataLength); i++) {
    for (const data of jsonData) {
      const res = await signup(
        `${data.login_id}__${i}@gmail.com`,
        '12345678',
        data.nickname,
      );
      await createLive(res.userId, `${data.stream_title}_${i}`, data.hash_tags);
      progress = ((j / dummyCount) * 100).toFixed(1);
      console.log(`progress: ${progress}%`);
      j++;

      if (j > dummyCount) {
        break;
      }
    }
  }
}
makeDummies();

// -------
// const insert = async () => {
//   for (let i = 0; i < 10; i++) {
//     const res = await signup(
//       faker.internet.email(),
//       '12345678',
//       faker.person.fullName(),
//     );
//     await subscribe(res.userId, 'cda7944b-7dea-4bf6-a1a5-721c416b9d04');
//   }
// };
// insert();

// // 가상 계정 10만개 생성
// for (let i = 0; i < 100000; i++) {
//   const res = await signup(`tester_${i}@gmail.com`, '12345678', `테스터_${i}`);
//   await subscribe(res.userId, '5710a530-0ce4-49fe-8413-53d0fa2f1709');
// }
