// Todo: 채팅, 다시보기, 채널정보, 후원하기 페이지, 알림 연결
const params = window.location.pathname;
const splits = params.split('/');
const liveId = splits[2];

console.log('라이브Id', liveId);
const subscribeBtn = document.getElementById('channel-subscribe-btn');

const getData = async () => {
  // 라이브방송 데이터 조회
  let channelId;
  let noticeId;
  fetch(`/api/lives/${liveId}`)
    .then((res) => res.json())
    .then((data) => {
      console.log('getChannelData', data);
      const liveTitle = document.querySelector('.live-title');
      const channelName = document.querySelector('.channel-name');
      const channelImg = document.querySelector('.channel-img');
      liveTitle.innerText = data.title;
      channelId = data.channel.id;
      channelName.innerText = data.channel.name;
      const imageUrl = data.channel.imageUrl || '/img/profile.jpg';
      channelImg.insertAdjacentHTML(
        'beforeend',
        `<img
            src="${imageUrl}"
            alt="profile_image"
            class="w-100 border-radius-lg shadow-sm"
          />`,
      );

      console.log(data);
      // 공지 조회
      fetch(`/api/${channelId}/notices`)
        .then((res) => res.json())
        .then((data) => {
          // console.log('공지id', data[0].id);
          if (data.length) {
            noticeId = data[0].id;
            document.querySelector('.channel-notice').innerText =
              data[0].content;
            document
              .querySelector('.channel-notice-img')
              .insertAdjacentHTML(
                'beforeEnd',
                `<img src="${data[0].imageUrl}" style="max-width: 800px">`,
              );
          }
          // 공지 댓글 조회
          fetch(`/api/${noticeId}/notice-comments`)
            .then((res) => res.json())
            .then((data) => {
              const commentList = document.querySelector('.notice-comments');
              commentList.insertAdjacentHTML(
                'beforeEnd',
                `<p> 댓글(${data.length})</p>`,
              );
              data.forEach((comment) => {
                commentList.insertAdjacentHTML(
                  'beforeEnd',
                  `<p style="padding: 0px; margin-bottom: 1px;">${comment.user.nickname} | ${comment.content}</p>`,
                );
              });
            });
        });
      fetch(`/api/subscribes/check/${channelId}`)
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          const { isSubscribed } = data;
          if (isSubscribed) {
            subscribeBtn.innerText = '구독취소';
          } else {
            subscribeBtn.innerText = '구독하기';
          }
        });
      subscribeBtn.setAttribute('data-channelId', `${channelId}`);
    });
};
getData();

document.querySelector('.notice-btn').addEventListener('click', () => {
  getNotice();
});
let isLoading;
subscribeBtn.addEventListener('click', async (e) => {
  if (isLoading) return;

  isLoading = true;

  const channelId = e.currentTarget.getAttribute('data-channelId');

  const response = await fetch('/api/subscribes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channelId,
    }),
  });
  const data = await response.json();
  const { isSubscribed } = data;

  if (isSubscribed) {
    subscribeBtn.innerText = '구독취소';
  } else {
    subscribeBtn.innerText = '구독하기';
  }

  isLoading = false;
});
