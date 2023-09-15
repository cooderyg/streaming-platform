// http://localhost:3000/notice/469068b1-1e6e-4042-9eaa-cb5b88e2f55d
const params = window.location.pathname;
const channelId = params.split('/')[2];

async function getMyChannelData(channelId) {
  // 채널 데이터
  // const res = await fetch('/api/channels');
  const res = await fetch(`/api/channels/${channelId}`);
  const data = await res.json();
  const channelName = data.name;
  // Todo:  배너,프로필 구분 필요
  const channelBannerImg =
    data.bannerImgUrl || '/img/curved-images/curved0.jpg';
  const streamerImg = data.user.profileImgUrl || '/img/profile.jpg';
  const subscribeCount = data.subscribes.length;
  const channelInfo = data.introduction || '';

  document.getElementById(
    'channel-banner-img',
  ).style.backgroundImage = `url(${channelBannerImg})`;
  document.getElementById('channel-img').insertAdjacentHTML(
    'beforeend',
    `<img src="${streamerImg}" alt="profile_image"
  class="w-100 border-radius-lg shadow-sm">`,
  );
  document.getElementById('channel-name').innerText = channelName;
  document
    .getElementById('channel-name')
    .setAttribute('href', `/channel/${channelId}`);
  document.getElementById(
    'channel-subscribe-count',
  ).innerText = `구독자: ${subscribeCount}명`;
  document.getElementById('channel-info').innerText = channelInfo;

  return [channelName, streamerImg];
}

async function getMyChannelNoticeData(channelId, channelName, profileImg) {
  const res = await fetch(`/api/${channelId}/notices`);
  const data = await res.json();

  const noticeContainer = document.getElementById('notice-container');
  noticeContainer.innerHTML = ''
  data.forEach(async (notice) => {
    const noticeDate = notice.createdAt.split('T')[0];
    const noticeContent = notice.content;
    const noticeId = notice.id;
    const noticeImg = notice.imageUrl;
    const noticeCommentData = notice.noticeComment

    noticeContainer.insertAdjacentHTML(
      'beforeend',
      `<div class="card mt-3" data-notice-id=${noticeId}>
        <div class="ms-3 mt-3 me-3 row">
          <div
          class="col-auto"
          id="channel-profile-image"
          style="width: 50px; height: 50px;
          background-image: url(${profileImg}); background-size: cover; border-radius: 10px;">
          </div>
          <div class="col-auto">
            <a href="/channel/${channelId}">${channelName}</a>
            <div style="font-size: 13px;">${noticeDate}</div>
          </div>
        </div>
        <span class="ms-3 mt-3 me-3">
          ${noticeContent}
        </span>
        <div class="ms-3 mt-3 me-3" style="width: auto;">
          ${
            noticeImg
              ? `<img src=${noticeImg}
          style="width: 80%; object-fit: contain; border-radius: 20px;">`
              : ''
          }
        </div>
        <div class="ms-3 mt-3 me-3 mb-3">
          <i class="fa fa-commenting-o" aria-hidden="true"></i>
          <a href="/comments/${channelId}?noticeId=${noticeId}">${
        noticeCommentData.length
      }</a>
        </div>
      </div>`,
    );
  });
}

// 시작
(async () => {
  // Channel 데이터 뿌려주기 + Id 획득
  const [channelName, profileImg] = await getMyChannelData(channelId);

  await getMyChannelNoticeData(channelId, channelName, profileImg);
})();
