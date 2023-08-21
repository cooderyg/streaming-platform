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

  const resLive = await fetch(`/api/lives/${liveId}`);
  const dataLive = await resLive.json();
  console.log('라이브데이터', dataLive);
  const liveTitle = document.querySelector('.live-title');
  const channelName = document.querySelector('.channel-name');
  const channelImg = document.querySelector('.channel-img');
  liveTitle.innerText = dataLive.title;
  channelId = dataLive.channel.id;
  console.log('채널아이디', channelId);
  channelName.innerText = dataLive.channel.name;
  const profileImgUrl = dataLive.channel.profileImgUrl || '/img/profile.jpg';
  channelImg.insertAdjacentHTML(
    'beforeend',
    `<img
            src="${profileImgUrl}"
            alt="profile_image"
            class="w-100 border-radius-lg shadow-sm"
          />`,
  );

  // 채널 데이터
  const resChannel = await fetch(`/api/channels/${channelId}`);
  const dataChannel = await resChannel.json();
  const channelInfo = dataChannel.introduction;
  const channelCreatedAt = dataChannel.createdAt.split('T')['0'];
  const streamerEmail = dataChannel.user.email;
  console.log('채널데이터', dataChannel);

  document
    .getElementById('channel-info')
    .insertAdjacentText('beforeend', channelInfo);
  document
    .getElementById('channel-created-at')
    .insertAdjacentText('beforeend', channelCreatedAt);
  document
    .getElementById('channel-contact-email')
    .insertAdjacentText('beforeend', streamerEmail);

  // 공지 조회
  const resNotice = await fetch(`/api/${channelId}/notices`);
  const dataNotice = await resNotice.json();

  if (dataNotice.length) {
    noticeId = dataNotice[0].id;
    document.querySelector('.channel-notice').innerText = dataNotice[0].content;
    document
      .querySelector('.channel-notice-img')
      .insertAdjacentHTML(
        'beforeEnd',
        `<img src="${dataNotice[0].imageUrl}" style="max-width: 800px">`,
      );
  }

  // 공지 댓글 조회
  const resComment = await fetch(`/api/${noticeId}/notice-comments`);
  const dataComment = await resComment.json();
  const commentList = document.querySelector('.notice-comments');
  commentList.insertAdjacentHTML(
    'beforeEnd',
    `<p> 댓글(${dataNotice.length})</p>`,
  );
  dataComment.forEach((comment) => {
    commentList.insertAdjacentHTML(
      'beforeEnd',
      `<p style="padding: 0px; margin-bottom: 1px;">${comment.user.nickname} | ${comment.content}</p>`,
    );
  });

  // 구독여부 확인
  fetch(`/api/subscribes/check/${channelId}`)
    .then((res) => res.json())
    .then((data) => {
      const { isSubscribed } = data;
      console.log(isSubscribed);
      if (isSubscribed) {
        subscribeBtn.innerText = '구독취소';
      } else {
        subscribeBtn.innerText = '구독하기';
      }
    });
  subscribeBtn.setAttribute('data-channelId', `${channelId}`);
};
getData();

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

const channelNoticeBtn = document.getElementById('notice-btn');
const channelInfoBtn = document.getElementById('channel-info-btn');
console.log(channelNoticeBtn);
console.log(channelInfoBtn);
channelInfoBtn.addEventListener('click', () => {
  document.getElementById('channel-notice-row').style.display = 'none';
  document.getElementById('channel-info-row').style.display = '';
});
channelNoticeBtn.addEventListener('click', () => {
  document.getElementById('channel-info-row').style.display = 'none';
  document.getElementById('channel-notice-row').style.display = '';
});
