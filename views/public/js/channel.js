const params = window.location.pathname;
const channelId = params.split('/')[2];
let channelName;
let channelInfo;
let channelBannerImg;

const getChannelData = async () => {
  // 채널 데이터
  const res = await fetch(`/api/channels/${channelId}`);
  const data = await res.json();
  channelName = data.name;
  channelInfo = data.introduction || '';
  // Todo:  배너,프로필 구분 필요
  channelBannerImg = data.bannerImgUrl || '../img/curved-images/curved0.jpg';
  const streamerImg = data.user.profileImgUrl || '/img/profile.jpg';
  console.log(channelBannerImg);
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

// const writeNotice = () => {
//   let imageUrl;
//   const noticeWriteBtn = document.getElementById('notice-write-btn');
//   noticeWriteBtn.addEventListener('click', async () => {
//     const content = document.getElementById('notice-content-input').value;
//     const noticeRes = await fetch(`/api/${channelId}/notices`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         content,
//         imageUrl: imageUrl || '',
//       }),
//     });
//     const noticeData = await noticeRes.json();
//   });

//   const noticeImageUploadBtn = document.getElementById(
//     'notice-image-upload-btn',
//   );
//   noticeImageUploadBtn.addEventListener('click', async () => {
//     const fileInput = document.getElementById('notice-img-input');
//     let formData = new FormData();
//     formData.append('file', fileInput.files[0]);
//     const uploadRes = await fetch('/api/uploads/channel-notice-image', {
//       method: 'POST',
//       cache: 'no-cache',
//       body: formData, // body 부분에 폼데이터 변수를 할당
//     });
//     const uploadData = await uploadRes.json();
//     imageUrl = uploadData.url;
//   });
// };

// const noticeWriteIcon = document.getElementById('notice-write-icon');
// noticeWriteIcon.addEventListener('click', () => {
//   writeNotice();
// });

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
    window.location.reload();
  });
};
// const channelImageUploadBtn = document.getElementById(
//   'channel-image-upload-btn',
// );
// channelImageUploadBtn.addEventListener('click', async () => {
//   const fileInput = document.getElementById('channel-img-input');
//   let formData = new FormData();
//   formData.append('file', fileInput.files[0]);
//   const uploadRes = await fetch('/api/uploads/channel-notice-image', {
//     method: 'POST',
//     cache: 'no-cache',
//     body: formData, // body 부분에 폼데이터 변수를 할당
//   });
//   const uploadData = await uploadRes.json();
//   channelBannerImg = uploadData.url;
// });

// const channelWriteIcon = document.getElementById('channel-write-btn');
// channelWriteIcon.addEventListener('click', () => {
//   writeChannel();
// });

// 다시보기 불러오기
const getReplays = async () => {
  // 다시보기 불러오기
  const replayContainer = document.getElementById('replay-container');
  const resReplay = await fetch(`/api/lives/replay/${channelId}`);
  const dataReplay = await resReplay.json();
  console.log(dataReplay);
  dataReplay.forEach((e) => {
    const liveId = e.id;
    const liveTitle = e.title;
    const createdAt = e.createdAt.split('T')[0];
    const thumbnailUrl = e.thumbnailUrl;

    const temp_html = `
    <div class="col-xl-3 col-md-6 mb-xl-0 mb-4 replay" data-live-id=${liveId}>
    <div class="card card-blog card-plain">
      <div class="position-relative">
        <a class="d-block shadow-xl border-radius-xl">
          <img
            src="${thumbnailUrl}"
            alt="img-blur-shadow"
            class="img-fluid shadow border-radius-xl"
          />
        </a>
      </div>
      <div class="card-body px-1 pb-0">
        <p class="text-gradient text-dark mb-2 text-sm">
          ${createdAt}
        </p>
        <a href="javascript:;">
          <h5>${liveTitle}</h5>
        </a>
        <p class="mb-4 text-sm">#부트스트랩 #코딩</p>
      </div>
    </div>
  </div>`;
    replayContainer.insertAdjacentHTML('beforeend', temp_html);
  });

  const replayEls = document.querySelectorAll('.replay');
  replayEls.forEach((replayEl) => {
    replayEl.addEventListener('click', (e) => {
      const liveId = e.currentTarget.getAttribute('data-live-id');
      window.location.href = `/replay/${liveId}`;
    });
  });
};

getReplays();

//후원랭킹top5
async function getChannelDonationTop5(channelId) {
  const historyRes = await fetch(`/api/credit-histories/channels/${channelId}`);
  const historyData = await historyRes.json();
  const top5 = document.getElementById('donation-top5');
  historyData.forEach((el) => {
    const nickname = el.user_nickname;
    const totalAmount = el.total_amount;
    const userImg = el.user_image_url || '/img/profile.jpg';
    const temp = `
    <li class="list-group-item border-0 d-flex align-items-center px-0 mb-2">
    <div class="avatar me-3">
      <img src="${userImg}" alt="kal" class="border-radius-lg shadow" />
    </div>
    <div class="d-flex align-items-start flex-column justify-content-center">
      <h6 class="mb-0 text-sm">${nickname}</h6>
      <p class="mb-0 text-xs">${totalAmount} 크레딧</p>
    </div>
  </li>
    `;

    top5.insertAdjacentHTML('beforeend', temp);
  });
}
getChannelDonationTop5(channelId);
