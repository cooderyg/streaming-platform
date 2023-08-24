const params = window.location.pathname;
const channelId = params.split('/')[2];
let channelName;
let channelInfo;
let channelBannerImg;

const getChannelData = async () => {
  // 채널 데이터
  const res = await fetch(`/api/channels/${channelId}`);
  const data = await res.json();
  console.log(data);
  channelName = data.name;
  channelInfo = data.introduction;
  // Todo:  배너,프로필 구분 필요
  channelBannerImg = data.bannerImgUrl || '../img/curved-images/curved0.jpg';
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
  document.getElementById(
    'channel-info-container',
  ).innerText = `${channelInfo}`;
};

const getChannelNoticeData = async () => {
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

const writeNotice = () => {
  let imageUrl;
  const noticeWriteBtn = document.getElementById('notice-write-btn');
  noticeWriteBtn.addEventListener('click', async () => {
    const content = document.getElementById('notice-content-input').value;
    const noticeRes = await fetch(`/api/${channelId}/notices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        imageUrl: imageUrl || '',
      }),
    });
    const noticeData = await noticeRes.json();
    console.log(noticeData);
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
};

const noticeWriteIcon = document.getElementById('notice-write-icon');
noticeWriteIcon.addEventListener('click', () => {
  writeNotice();
});

const writeChannel = async () => {
  let bannerImgUrl;
  const channelWriteBtn = document.getElementById('channel-write-btn');
  channelWriteBtn.addEventListener('click', async () => {
    const name = document.getElementById('channel-name-input').value;
    const introduction = document.getElementById(
      'channel-introduction-input',
    ).value;
    const CategoryIds = document.getElementById('channel-category-input').value;
    const categoryIds = CategoryIds.split(',').map((item) => item.trim());
    const channelRes = await fetch(`/api/channels/update/${channelId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name || channelName,
        introduction: introduction || channelInfo,
        categoryIds: categoryIds || [''],
        bannerImgUrl: channelBannerImg,
      }),
    });
    const channelData = await channelRes.json();
    console.log(channelData);
    // window.location.reload();
  });
};
const channelImageUploadBtn = document.getElementById(
  'channel-image-upload-btn',
);
channelImageUploadBtn.addEventListener('click', async () => {
  const fileInput = document.getElementById('channel-img-input');
  console.log(fileInput);
  let formData = new FormData();
  formData.append('file', fileInput.files[0]);
  const uploadRes = await fetch('/api/uploads/channel-notice-image', {
    method: 'POST',
    cache: 'no-cache',
    body: formData, // body 부분에 폼데이터 변수를 할당
  });
  const uploadData = await uploadRes.json();
  console.log(uploadData);
  channelBannerImg = uploadData.url;
});

const channelWriteIcon = document.getElementById('channel-write-btn');
channelWriteIcon.addEventListener('click', () => {
  writeChannel();
});
