async function getMyChannelData() {
  // 채널 데이터
  const res = await fetch('/api/channels');
  const data = await res.json();
  const channelName = data.name;
  // Todo:  배너,프로필 구분 필요
  const channelBannerImg =
    data.bannerImgUrl || '/img/curved-images/curved0.jpg';
  const streamerImg = data.user.profileImgUrl || '/img/profile.jpg';
  const channelCreatedAt = data.createdAt.split('T')['0'];
  const subscribeCount = data.subscribes.length;
  const streamerEmail = data.user.email;
  const channelInfo = data.introduction || '';

  console.log(data);

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
        `<div>
        <p data-notice-id=${noticeId} style=" white-space: nowrap;  overflow: hidden;text-overflow: ellipsis;" data-bs-toggle="modal" data-bs-target="#notice-detail-modal">${noticeContent}&nbsp;<i class="fa-regular fa-image"></i></p>
        </div>`,
      );
    } else {
      channelNotices.insertAdjacentHTML(
        'beforeend',
        `<div>
        <p data-notice-id=${noticeId} style=" white-space: nowrap;  overflow: hidden;text-overflow: ellipsis;" data-bs-toggle="modal" data-bs-target="#notice-detail-modal">${noticeContent}</p>
        </div>`,
      );
    }
  });
}

// 공지 상세 받아오기
const getNoticeDetail = async (channelId) => {
  const noticeDetailModal = document.getElementById('notice-detail-modal');
  console.log(noticeDetailModal);
  noticeDetailModal.addEventListener('shown.bs.modal', async (event) => {
    const notice = event.relatedTarget;
    const noticeId = notice.getAttribute('data-notice-id');
    const res = await fetch(`/api/${channelId}/notices/${noticeId}`);
    const data = await res.json();
    console.log(data);
    const temp = `<img src="${data.imageUrl}">
    <div>${data.content}</div>
    <div>${data.createdAt.split('T')[0]}`;
    document.getElementById('notice-detail-body').innerHTML = temp;
    document
      .getElementById('notice-delete-btn')
      .setAttribute('data-notice-id', noticeId);
    deleteNotice(channelId);
  });
};

//공지 삭제
const deleteNotice = (channelId) => {
  const noticeDeleteBtn = document.getElementById('notice-delete-btn');
  noticeDeleteBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const noticeId = noticeDeleteBtn.getAttribute('data-notice-id');
    const res = await fetch(`/api/${channelId}/notices/${noticeId}`, {
      method: 'DELETE',
    });
    const data = res.json();
    console.log(data);
    window.location.reload();
  });
};

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
  console.log(noticeImageUploadBtn);
  noticeImageUploadBtn.addEventListener('click', async () => {
    console.log('클릭!');
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
    console.log(imageUrl);
  });
}

// 카테고리2개이상 클릭시 alert
const maxAllowedCategories = 2;
const categoryCheckboxes = document.querySelectorAll(
  '.form-checkCategory-input',
);
let selectedCategories = 0;

categoryCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      if (selectedCategories >= maxAllowedCategories) {
        checkbox.checked = false;
        alert('최대 2개의 카테고리까지 선택할 수 있습니다.');
      } else {
        selectedCategories++;
      }
    } else {
      selectedCategories--;
    }
  });
});

// 변경할 베너 이미지 값 가져오기
let bannerImgUrl = document.getElementById('channel-img-input').value;
console.log(bannerImgUrl);

const channelImageUploadBtn = document.getElementById(
  'channel-image-upload-btn',
);
channelImageUploadBtn.addEventListener('click', async () => {
  const fileInput = document.getElementById('channel-img-input');
  let formData = new FormData();
  formData.append('file', fileInput.files[0]);
  console.log(fileInput.files[0]);
  const uploadRes = await fetch('/api/uploads/channel-notice-image', {
    method: 'POST',
    cache: 'no-cache',
    body: formData, // body 부분에 폼데이터 변수를 할당
  });
  const uploadData = await uploadRes.json();
  bannerImgUrl = uploadData.url;
  console.log(bannerImgUrl);
});

async function writeMyChannel(channelId) {
  // 채널 데이터
  const res = await fetch(`/api/channels/${channelId}`);
  const data = await res.json();
  const channelName = data.name;
  const channelBannerImg =
    data.bannerImgUrl || '../img/curved-images/curved0.jpg';
  const channelIntroduction = data.introduction;
  const channelCategories = data.categories;

  // 변경할 채널 타이틀, 채널 소개 값 가져오기
  const name = document.getElementById('channel-name-input').value;
  const introduction = document.getElementById(
    'channel-introduction-input',
  ).value;
  // 변경할 카테고리 값 가져오기
  const categoryCheckboxes = document.querySelectorAll(
    '.form-checkCategory-input',
  );
  const categoryIds = [];

  categoryCheckboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      categoryIds.push(checkbox.value);
    }
  });

  await fetch(`/api/channels/update/${channelId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name || channelName,
      introduction: introduction || channelIntroduction,
      categoryIds: categoryIds,
      bannerImgUrl: bannerImgUrl || channelBannerImg,
    }),
  });
}
// 시작
(async () => {
  // Channel 데이터 뿌려주기 + Id 획득
  const channelId = await getMyChannelData();

  // Notice 데이터 뿌려주기
  await getMyChannelNoticeData(channelId);

  // NoticeDetail 모달 활성화
  await getNoticeDetail(channelId);

  //후원 top5명 뿌려주기
  await getChannelDonationTop5(channelId);
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
