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
  const streamerImg = data.user.imageUrl || '/img/profile.jpg';
  const subscribeCount = data.subscribes.length;
  const channelInfo = data.introduction || '';
  console.log(data.user);
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

// one notice-content
async function getMyChannelNoticeData(
  channelName,
  profileImg,
  noticeCommentData,
) {
  const res = await fetch(`/api/${channelId}/notices/${noticeId}`);
  const notice = await res.json();

  const noticeContainer = document.getElementById('notice-container');
  noticeContainer.innerHTML = '';

  const noticeDate = notice.createdAt.split('T')[0];
  const noticeContent = notice.content;
  const noticeImg = notice.imageUrl;

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
          <form id="comment-form" action="#" method="post">
            <input class="form-control-sm col-10" placeholder="댓글 추가..." type="text" id="comment-input" name="comment" required size=60 style="border: none; border-bottom: 1px solid; border-radius: 0px;">
          </form>
        </div>
      </div>
    </div>`,
  );

  const noticeCard = document.getElementById('notice-card');
  noticeCommentData.forEach((comment) => {
    noticeCard.insertAdjacentHTML(
      'beforeend',
      `<div class="ms-3 mt-3 me-3 mb-3 row gx-4">
        <div
          class="col-auto"
          id="channel-profile-image"
          style="width: 35px; height: 35px;
          background-image: url(${
            comment.user.imageUrl || '/img/profile.jpg'
          }); background-size: cover; border-radius: 10px;">
        </div>
        <div class="col-auto my-auto">
          <a href="#">${comment.user.nickname}</a>
          <span style="font-size: 13px;">${
            comment.createdAt.split('T')[0]
          }</span>
        </div>
        <div class="my-auto" style="padding: 0; padding-left: 47px;">
          <span>${comment.content}</span>
        </div>
      </div>`,
    );
  });
}

// 시작
(async () => {
  // Channel 데이터 뿌려주기 + Id 획득
  const [channelName, profileImg] = await getMyChannelData(channelId);

  // 코멘트 가져오기
  const noticeCommentData = await getNoticeComment(noticeId);

  await getMyChannelNoticeData(channelName, profileImg, noticeCommentData);

  // 댓글 작성
  document
    .getElementById('comment-form')
    .addEventListener('submit', async (e) => {
      e.preventDefault(); // 폼 제출 이벤트 기본 동작을 막습니다.

      // 입력된 댓글 내용 가져오기
      const commentText = document.getElementById('comment-input').value;

      const data = {
        content: commentText,
      };

      // POST 요청 보내기
      const response = fetch(`/api/${noticeId}/notice-comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      window.location.reload();
    });
})();
