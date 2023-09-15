//\ 다시보기 후원하기 페이지, 알림 연결
const params = window.location.pathname;
const splits = params.split('/');
const liveId = splits[2];

const subscribeBtn = document.getElementById('channel-subscribe-btn');

const getData = async () => {
  // 라이브방송 데이터 조회
  // let channelId;
  let noticeId;
  const channelImg = document.querySelector('.channel-img');
  const liveInfoContainer = document.getElementById('live-info-container');

  const resLive = await fetch(`/api/lives/${liveId}`);
  const dataLive = await resLive.json();
  const channelId = dataLive.channel.id;
  const liveTitle = dataLive.title;
  const channelName = dataLive.channel.name;

  liveInfoContainer.insertAdjacentHTML(
    'beforeend',
    `<h5 class="mb-1">${liveTitle}</h5>
    <a href='/channel/${channelId}' class="mb-0 font-weight-bold text-sm">${channelName}</a>`,
  );

  const profileImgUrl = dataLive.channel.profileImgUrl || '/img/profile.jpg';
  channelImg.insertAdjacentHTML(
    'beforeend',
    `<a href='/channel/${channelId}'><img
            src="${profileImgUrl}"
            alt="profile_image"
            class="w-100 border-radius-lg shadow-sm"
          /></a>`,
  );

  // 채널 데이터
  const resChannel = await fetch(`/api/channels/${channelId}`);
  const dataChannel = await resChannel.json();
  const channelInfo = dataChannel.introduction || '등록된 채널정보가 없습니다.';
  const channelCreatedAt = dataChannel.createdAt.split('T')['0'];
  const streamerEmail = dataChannel.user.email;

  document
    .getElementById('channel-info')
    .insertAdjacentText('beforeend', channelInfo);
  document
    .getElementById('channel-created-at')
    .insertAdjacentText('beforeend', channelCreatedAt);
  document
    .getElementById('channel-contact-email')
    .insertAdjacentText('beforeend', streamerEmail);

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

  // 매니저 확인
  fetch(`/api/channels/${channelId}/admin/managers`)
    .then((res) => res.json())
    .then((data) => {
      const isChannelManager = data.some((item) => item.id === user.id);
      if (isChannelManager) {
        const btn = document.getElementById('channel-usr-ban-btn');
        btn.style.display = 'block';
      }
    });

  // 다시보기 불러오기
  const replayContainer = document.getElementById('replay-container');
  const resReplay = await fetch(`/api/lives/replay/${channelId}`);
  const dataReplay = await resReplay.json();
  if (dataReplay.length) {
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
  } else {
    replayContainer.parentNode.innerText = '이 채널의 다시보기가 없습니다.';
  }
};
getData();

// 채팅 밴

const banUserBtn = document.getElementById('user-ban-btn');

banUserBtn.addEventListener('click', async () => {
  const userNickname = document.getElementById('ban-user-input').value;
  const banReason = document.getElementById('ban-reason-input').value;

  await fetch(`/api/channel/${channelId}/ban`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userNickname: userNickname,
      reason: banReason,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((errorData) => {
          throw new Error(errorData.message);
        });
      }
      return response.json();
    })
    .then((data) => {
      alert(`${userNickname}님의 채팅을 금지했습니다.`);
      if (data) {
        socket.emit('ban');
      }
    })
    .catch((error) => {
      alert(`${error.message}`);
    });
});

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

//비디오 플레이어 설정
// const mediaContainerEl = document.querySelector('#media-container');
// mediaContainerEl.innerHTML = `<video id="video" width="100%" height="100%" controls autoplay></video>`;
const video = document.getElementById('video');
const videoSrc = `http://localhost:8000/live/${liveId}/index.m3u8`;
// const videoSrc = `http://d2hv45obrzuf2s.cloudfront.net/videos/${liveId}/index.m3u8`;
const hlsConfig = {
  debug: true,
  enableWorker: true,
  lowLatencyMode: true,
  backBufferLength: 90,
  liveDurationInfinity: true,
  liveSyncDurationCount: 1,
};

setTimeout(() => {
  if (Hls.isSupported()) {
    const hls = new Hls(hlsConfig);
    // hls.startLoad(startPosition);
    hls.loadSource(videoSrc);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play();
    });
    video.addEventListener('play', () => {
      hls.media.currentTime = hls.liveSyncPosition;
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = videoSrc;
    video.addEventListener('loadedmetadata', () => {
      try {
        video.play();
        video.addEventListener('play', () => {
          const duration = video.duration;
          video.currentTime = duration;
        });
      } catch (error) {
        console.error(error);
      }
    });
  }
}, 1000);
