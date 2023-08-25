async function getMyChannelData() {
  // 채널 데이터
  const res = await fetch('/api/channels');
  const data = await res.json();
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

  return data.id;
}

async function getMyChannelNoticeData(channelId) {
  const res = await fetch(`/api/${channelId}/notices`);
  const data = await res.json();
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
}

function mySubscribe(channelId) {
  fetch('/api/subscribes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ channelId }),
  });
  window.location.reload();
}

async function writeMyNotice(channelId) {
  let imageUrl;
  const noticeWriteBtn = document.getElementById('notice-write-btn');
  noticeWriteBtn.addEventListener('click', async () => {
    const content = document.getElementById('notice-content-input').value;
    await fetch(`/api/${channelId}/notices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        imageUrl,
      }),
    });
  });

  const noticeImageUploadBtn = document.getElementById(
    'notice-image-upload-btn',
  );
  noticeImageUploadBtn.addEventListener('click', async () => {
    const fileInput = document.getElementById('notice-img-input');
    let formData = new FormData();
    formData.append('file', fileInput.files[0]);

    const uploadRes = await fetch('/api/uploads/channel-notice-image', {
      method: 'POST',
      cache: 'no-cache',
      body: formData, // body 부분에 폼데이터 변수를 할당
    });
    const uploadData = await uploadRes.json();
    imageUrl = uploadData.url;
  });
}

async function writeMyChannel() {
  let bannerImgUrl;
  const channelWriteBtn = document.getElementById('channel-write-btn');
  channelWriteBtn.addEventListener('click', async () => {
    const name = document.getElementById('channel-name-input').value;
    const introduction = document.getElementById(
      'channel-introduction-input',
    ).value;
    const CategoryIds = document.getElementById('channel-category-input').value;
    const categoryIds = CategoryIds.split(',').map((item) => item.trim());
    const bannerImgUrl = document.getElementById('channel-img-input').value;

    await fetch(`/api/channels/update/${channelId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        introduction: introduction,
        categoryIds: categoryIds,
        bannerImgUrl: bannerImgUrl,
      }),
    });
  });
  const channelImageUploadBtn = document.getElementById(
    'channel-image-upload-btn',
  );
  channelImageUploadBtn.addEventListener('click', async () => {
    const fileInput = document.getElementById('channel-img-input');
    let formData = new FormData();
    formData.append('file', fileInput.files[0]);
    console.log(formData);
    const uploadRes = await fetch('/api/uploads/channel-notice-image', {
      method: 'POST',
      cache: 'no-cache',
      body: formData, // body 부분에 폼데이터 변수를 할당
    });
    const uploadData = await uploadRes.json();
    bannerImgUrl = uploadData.url;
  });
}

// 시작
(async () => {
  // Channel 데이터 뿌려주기 + Id 획득
  const channelId = await getMyChannelData();

  // Notice 데이터 뿌려주기
  await getMyChannelNoticeData(channelId);
  // Notice 편집 이벤트 등록
  const noticeWriteIcon = document.getElementById('notice-write-icon');
  noticeWriteIcon.addEventListener('click', () => {
    writeMyNotice(channelId);
  });
  // Channel 수정 이벤트 등록
  const channelWriteIcon = document.getElementById('channel-write-btn');
  channelWriteIcon.addEventListener('click', () => {
    writeMyChannel(channelId);
  });
  // 구독하기 이벤트 등록
  const subscribeBtn = document.getElementById('channel-subscribe-btn');
  subscribeBtn.addEventListener('click', () => {
    mySubscribe(channelId);
  });
})();