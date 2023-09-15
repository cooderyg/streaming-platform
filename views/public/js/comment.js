// http://localhost:3000/comments/469068b1-1e6e-4042-9eaa-cb5b88e2f55d?noticeId=0ff5a993-8150-4d70-9900-e9d9e84fb352
const params = window.location.pathname;
const query = window.location.search;

const channelId = params.split('/')[2];
const noticeId = query.split('=')[1];

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

// notice-comment get
async function getNoticeComment(noticeId) {
  const res = await fetch(`/api/${noticeId}/notice-comments`);
  const data = await res.json();
  return data;
}

async function getMyChannelNoticeData(channelName, profileImg) {
  const res = await fetch(`/api/${channelId}/notices/${noticeId}`);
  const notice = await res.json();

  const noticeContainer = document.getElementById('notice-container');

  const noticeDate = notice.createdAt.split('T')[0];
  const noticeContent = notice.content;
  const noticeImg = notice.imageUrl;

  // 코멘트 가져오기
  const noticeCommentData = await getNoticeComment(noticeId);
  console.log(noticeCommentData);
  noticeContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="card mt-3" data-notice-id=${noticeId} id="notice-card">
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
            ? `<img src=${noticeImg} style="width: 80%; object-fit: contain; border-radius: 20px;">`
            : ''
        }
      </div>
      <div class="ms-3 mt-3 me-3 mb-3">
        <!-- 여기에 댓글 입력란이 들어가야 합니다. -->
        <div>
          <input type="text" placeholder="댓글다는자리">
        </div>
      </div>
    </div>`,
  );
  
  noticeCommentData`<div class="ms-3 mt-3 me-3 mb-3">
      <div>
        댓글들 들어갈 자리
      </div>
    </div>`;
}

// 시작
(async () => {
  // Channel 데이터 뿌려주기 + Id 획득
  const [channelName, profileImg] = await getMyChannelData(channelId);

  await getMyChannelNoticeData(channelName, profileImg);
})();
