const params = window.location.pathname;
const channelId = params.split('/')[2];

// '공지 사항' 링크 추가
document
  .getElementById('notice-label')
  .setAttribute('href', `/notice/${channelId}`);

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
    const noticeDate = notice.createdAt.split('T')[0];
    const noticeContent = notice.content;
    const noticeId = notice.id;
    const noticeImg = notice.imageUrl;
    if (noticeImg.length) {
      channelNotices.insertAdjacentHTML(
        'beforeend',
        `<div>
        <a href="/comments/${channelId}?noticeId=${noticeId}" data-notice-id=${noticeId} style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 300px; display: inline-block; margin-bottom: 0;">${noticeContent}&nbsp;<i class="fa-regular fa-image"></i></a>
        <p style="font-size: 10px;">${noticeDate}</p>
        </div>`,
      );
    } else {
      channelNotices.insertAdjacentHTML(
        'beforeend',
        `<div>
        <a href="/comments/${channelId}?noticeId=${noticeId}" data-notice-id=${noticeId} style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 300px; display: inline-block; margin-bottom: 0;">${noticeContent}</a>
        <p style="font-size: 10px;">${noticeDate}</p>
        </div>`,
      );
    }
  });
};
// // 공지 상세 받아오기
// const getNoticeDetail = async (channelId) => {
//   const noticeDetailModal = document.getElementById('notice-detail-modal');
//   noticeDetailModal.addEventListener('shown.bs.modal', async (event) => {
//     const notice = event.relatedTarget;
//     const noticeId = notice.getAttribute('data-notice-id');
//     const res = await fetch(`/api/${channelId}/notices/${noticeId}`);
//     const data = await res.json();
//     if (data.imageUrl) {
//       const temp = `<img src="${
//         data.imageUrl
//       }" style="width: 100%; height: 100%; object-fit: contain;">
//       <div>${data.content}</div>
//       <div>${data.createdAt.split('T')[0]}`;
//       document.getElementById('notice-detail-body').innerHTML = temp;
//     } else {
//       const temp = `
//       <div>${data.content}</div>
//       <div>${data.createdAt.split('T')[0]}`;
//       document.getElementById('notice-detail-body').innerHTML = temp;
//     }
//   });
// };

getChannelData();
getChannelNoticeData();
getNoticeDetail(channelId);

// 구독하기
const subscribeBtn = document.getElementById('channel-subscribe-btn');
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
  window.location.reload();
});

// 구독여부 확인
fetch(`/api/subscribes/check/${channelId}`)
  .then((res) => res.json())
  .then((data) => {
    const { isSubscribed } = data;
    if (isSubscribed) {
      subscribeBtn.innerText = '구독취소';
    } else {
      subscribeBtn.innerText = '구독하기';
    }
  });
subscribeBtn.setAttribute('data-channelId', `${channelId}`);

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
let io;
let isFirst = true;
let count = 1;
let lastDiv;
const replayContainer = document.getElementById('replay-container');
const setReplay = (data) => {
  data.forEach((e) => {
    const liveId = e.id;
    const liveTitle = e.title;
    const createdAt = e.createdAt.split('T')[0];
    const thumbnailUrl = e.thumbnailUrl || '../img/freelyb-banner.png';

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

const getReplays = async () => {
  console.log('겟');
  if (!isFirst) {
    io.disconnect();
  }
  isFirst = false;
  count = 1;

  io = new IntersectionObserver((entries, observer) => {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        count++;
        io.unobserve(lastDiv);
        const ioFetch = async () => {
          try {
            const response = await fetch(
              `/api/lives/replay/${channelId}?page=${count}&size=8`,
            );
            const data = await response.json();

            if (data.length) {
              setReplay(data);
              lastDiv = document.querySelector(
                '#replay-container > div:last-child',
              );
              io.observe(lastDiv);
            }
          } catch (err) {
            console.error(err);
          }
        };
        ioFetch();
      }
    });
  });

  try {
    const resReplay = await fetch(
      `/api/lives/replay/${channelId}?page=${count}&size=8`,
    );
    const dataReplay = await resReplay.json();
    dataReplay.forEach((e) => {
      const liveId = e.id;
      const liveTitle = e.title;
      const createdAt = e.createdAt.split('T')[0];
      const thumbnailUrl = e.thumbnailUrl || '../img/freelyb-banner.png';

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
    lastDiv = document.querySelector('#replay-container > div:last-child');
    io.observe(lastDiv);
  } catch (err) {
    console.error(err);
  }
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
