const { faker } = require('@faker-js/faker');

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

const createLive = async (title, tagNames) => {
  const response = await fetch('http://127.0.0.1:3000/api/lives', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
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

// const jsonFile = fs.readFileSync('./twitch_data.json', 'utf8');
// const jsonData = JSON.parse(jsonFile); // 더미 364개

// 트위치 데이터로 유저 생성 및 구독
// for (let i = 0; i < Math.ceil(10000 / 364); i++) {
//   jsonData.forEach(async (data) => {
//     const res = await signup(
//       faker.internet.email(),
//       '12345678',
//       faker.person.fullName(),
//     );

//     // 96대장영큐: 'cda7944b-7dea-4bf6-a1a5-721c416b9d04'
//     await subscribe(res.userId, 'cda7944b-7dea-4bf6-a1a5-721c416b9d04');
//   });
// }
const insert = async () => {
  for (let i = 0; i < 10; i++) {
    const res = await signup(
      faker.internet.email(),
      '12345678',
      faker.person.fullName(),
    );
    await subscribe(res.userId, 'cda7944b-7dea-4bf6-a1a5-721c416b9d04');
  }
};
insert();
// // 가상 계정 10만개 생성
// for (let i = 0; i < 100000; i++) {
//   const res = await signup(`tester_${i}@gmail.com`, '12345678', `테스터_${i}`);
//   await subscribe(res.userId, '5710a530-0ce4-49fe-8413-53d0fa2f1709');
// }
