let socket;
let user;

liveExistCheck();
setLiveStartBtn();

async function liveExistCheck() {
  const liveRoom = await findOpenedLiveRoom();
  if (!liveRoom) return;
  getReadyForStream(liveRoom.id);
  if (liveRoom.onAir) {
    setMedia(liveRoom.id);
  }
}

async function getReadyForStream(liveId) {
  socket = io('/', { extraHeaders: { 'room-id': liveId } });
  user = await getUserData();
  await showLiveRoomData(liveId);
  setEventListeners(liveId, user);
  setStreamKey(liveId);

  switchStreamKeyBtnToUpdateChannelInfoBtn();
  setUpdateChannelInfoBtn(liveId);
}

function setEventListeners(liveId, user) {
  setLiveEvent();
  setChatEvent(liveId, user);
  setViewCountEvent();
}

function setStreamKey(liveId) {
  showStreamKey(liveId);
  setEyeBtn();
  setCopyBtn();
}

async function getUserData() {
  const response = await fetch('/api/users');
  if (!response.ok) return;
  const data = await response.json();
  return data;
}

async function showLiveRoomData(liveId) {
  const response = await fetch(`/api/lives/${liveId}`);
  const liveRoomData = await response.json();
  const [title, channelName, channelImgUrl] = [
    liveRoomData.title,
    liveRoomData.channel.name,
    liveRoomData.channel.profileImgUrl || '/img/profile.jpg',
  ];

  document.querySelector('.live-title').innerText = title;
  document.querySelector('.channel-name').innerText = channelName;
  document.querySelector('.channel-img').innerHTML = `
    <img src="${channelImgUrl}" alt="profile_image" class="w-100 border-radius-lg shadow-sm"/>
  `;
}

function setLiveStartBtn() {
  const liveStartBtn = document.getElementById('live-start-btn');
  liveStartBtn.addEventListener('click', async () => {
    const liveTitleInput = document.getElementById('live-title-input').value;
    const liveTagInput = document.getElementById('live-tag-input').value;
    const tagNames = liveTagInput.split(',');
    const res = await fetch(`/api/lives/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: liveTitleInput,
        tagNames,
      }),
    });
    if (!res.ok) return alert('방송 시작에 실패했습니다. 다시 시도해주세요.');
    const data = await res.json();
    getReadyForStream(data.id);
  });
}

function switchStreamKeyBtnToUpdateChannelInfoBtn() {
  const liveModalBtn = document.getElementById('live-modal-btn');
  const liveUpdateModalBtn = document.getElementById('live-update-modal-btn');

  liveModalBtn.style.display = 'none'; // streamKey Btn
  liveUpdateModalBtn.style.display = ''; // updateChannelInfo Btn
}

function setUpdateChannelInfoBtn(liveId) {
  const updateSaveBtn = document.getElementById('update-save-btn');
  updateSaveBtn.addEventListener('click', async () => {
    const updateTitleInput =
      document.getElementById('update-title-input').value;
    const updateTagInput = document.getElementById('update-tag-input').value;
    const tagNames = updateTagInput.split(',');
    const res = await fetch(`/api/lives/${liveId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: updateTitleInput,
        tagNames,
      }),
    });
    const data = await res.json();
    showLiveRoomData(liveId);
  });
}

function showStreamKey(liveId) {
  const liveKeyEl = document.querySelector('#live-key');
  liveKeyEl.removeAttribute('class');
  liveKeyEl.style.textAlign = 'right';
  liveKeyEl.insertAdjacentHTML(
    'beforeend',
    ` <span id='stream-key' style='display: none;'>stream-key: ${liveId}</span>
      <i class="fas fa-eye fa-xl" id='key-hide-btn' style='cursor: pointer;'></i>
      <i class="fa fa-copy fa-xl" id='key-copy' style='cursor: pointer;'></i>
    `,
  );
}

function setEyeBtn() {
  const hideBtn = document.getElementById('key-hide-btn');
  hideBtn.addEventListener('click', () => {
    const streamKeyEl = document.getElementById('stream-key');
    if (streamKeyEl.style.display === 'none') {
      streamKeyEl.style.display = '';
    } else {
      streamKeyEl.style.display = 'none';
    }
  });
}

function setCopyBtn() {
  const copyBtn = document.getElementById('key-copy');
  copyBtn.addEventListener('click', () => {
    const streamKeyEl = document.getElementById('stream-key');
    const streamKey = streamKeyEl.textContent.split(' ')[1];
    navigator.clipboard.writeText(streamKey);
  });
}

function setMedia(liveId) {
  document.querySelector('#media-container').innerHTML = `
  <video
    id="video"
    width="100%"
    height="100%"
    controls
    autoplay
  ></video>
`;
  const video = document.getElementById('video');
  // `http://d2hv45obrzuf2s.cloudfront.net/videos/${liveId}/index.m3u8`
  const videoSrc = `http://localhost:8000/live/${liveId}/index.m3u8`;
  const hlsConfig = {
    debug: true,
    enableWorker: true,
    lowLatencyMode: true,
    backBufferLength: 90,
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
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSrc;
      video.addEventListener('loadedmetadata', () => {
        video.play();
      });
    }
  }, 10000);
}

async function findOpenedLiveRoom() {
  try {
    const response = await fetch('/api/lives/admin/control');
    const data = await response.json();
    return data;
  } catch (err) {
    return false;
  }
}

function setLiveEvent() {
  socket.on('startLive', ({ liveId }) => {
    setMedia(liveId);
  });

  socket.on('endLive', () => {
    alert('방송이 종료되었습니다.');
  });
}

function setChatEvent(liveId, user) {
  const roomId = liveId;
  const chatBtn = document.querySelector('#button-addon2');
  const chatInput = document.querySelector('#chat-input');
  const chatContainerEl = document.querySelector('#chat-container');

  // 소켓 카운트
  let socketCommCount = 0;

  chatInput.addEventListener('keydown', (e) => {
    if (e.keyCode === 13) chatBtn.click();
  });

  chatBtn.addEventListener('click', () => {
    if (chatInput.value === '') return alert('채팅을 입력해주세요.');

    if (!socketCommCount) {
      socket.emit('chat', {
        chat: chatInput.value,
        user,
      });
      socketCommCount++;
    } else {
      socket.emit('chat', {
        chat: chatInput.value,
      });
    }
    chatInput.value = '';
  });

  // 채팅받기
  socket.on('chat', (data) => {
    const chat = data.chat;
    const nickname = data.user.nickname;
    const img = data.user.imageUrl ? data.user.imageUrl : '/img/profile.jpg';
    const temp = `
    <div class="d-flex justify-content-start mb-1">
      <div class="img_cont_msg">
        <img src="${img}" class="rounded-circle user_img_msg">
      </div>
      <div class="msg_container">
        <span class="user_nick">${nickname}</span>
        <span class="user_chat">${chat}</span>
      </div>
    </div>
  `;
    chatContainerEl.insertAdjacentHTML('beforeend', temp);
    chatContainerEl.scrollTop = chatContainerEl.scrollHeight;
  });

  socket.on('donation', (data) => {
    const { amount, nickname } = data;

    const temp = `
    <div class="d-flex justify-content-center my-4">
      <div class="d-flex justify-content-center flex-column">
        <img src="/img/coin.jpg" class="mb-1 donation-img" />
        <div class="user_chat donaiton-msg">${nickname} 님이 <br /> ${amount}크레딧을 후원하셨습니다.</div>
      </div>
    </div>
    `;

    chatContainerEl.insertAdjacentHTML('beforeend', temp);
    chatContainerEl.scrollTop = chatContainerEl.scrollHeight;
  });
}

// 시청자수 받기
function setViewCountEvent() {
  const userConutEl = document.querySelector('#user-count');
  socket.on('userCount', (data) => {
    userConutEl.innerText = `시청자 ${data.userCount}` || `시청자 0`;
  });
}
