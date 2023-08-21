const params = window.location.pathname;
const channelId = params.split('/')[2];

const getChannelData = async () => {
  // 채널 데이터
  const res = await fetch(`/api/channels/${channelId}`);
  const data = await res.json();
  console.log(data);
  const channelName = data.name;
  // Todo:  배너,프로필 구분 필요
  const channelBannerImg =
    data.bannerImgUrl || '../img/curved-images/curved0.jpg';
  const streamerImg = data.user.profileImgUrl || '/img/profile.jpg';
  const channelCreatedAt = data.createdAt.split('T')['0'];
  const subscribeCount = data.subscribes.length;
  const streamerEmail = data.user.email;

  document.getElementById(
    'channel-banner-img',
  ).style.backgroundImage = `url(${channelBannerImg})`;
  document.getElementById('channel-img').insertAdjacentHTML(
    'beforeend',
    `<img src="${streamerImg}" alt="profile_image"
  class="w-100 border-radius-lg shadow-sm">`,
  );
  document.getElementById('channel-name').innerText = channelName;
  document.getElementById(
    'channel-subscribe-count',
  ).innerText = `구독자: ${subscribeCount}명`;
  document
    .getElementById('channel-created-at')
    .insertAdjacentText('beforeend', channelCreatedAt);
  document
    .getElementById('channel-contact-email')
    .insertAdjacentText('beforeend', streamerEmail);
};

const getChannelNoticeData = async () => {
  const res = await fetch(`/api/${channelId}/notices`);
  const data = await res.json();
  console.log('공지데이터', data);
  const channelNotices = document.getElementById('channel-notices');
  data.forEach((notice) => {
    const noticeContent = notice.content;
    const noticeId = notice.id;
    const noticeImg = notice.imageUrl;
    if (noticeImg.length) {
      channelNotices.insertAdjacentHTML(
        'beforeend',
        `<p data-notice-id=${noticeId}>${noticeContent}&nbsp;<i class="fa-regular fa-image"></i></p>`,
      );
    } else {
      channelNotices.insertAdjacentHTML(
        'beforeend',
        `<p data-notice-id=${noticeId}>${noticeContent}</p>`,
      );
    }
  });
};

getChannelData();
getChannelNoticeData();

const subscribeBtn = document.getElementById('channel-subscribe-btn');
subscribeBtn.addEventListener('click', function (event) {
  fetch('/api/subscribes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channelId,
    }),
  });
  window.location.reload();
});
