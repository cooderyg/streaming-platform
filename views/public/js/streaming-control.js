let user;

const mediaContainerEl = document.querySelector('#media-container');

const getUserData = async () => {
  const response = await fetch('/api/users');
  if (!response.ok) return;
  const data = await response.json();
  user = data;
  console.log(user);
};
getUserData();

// 라이브방송 데이터 조회
const getData = async (liveId) => {
  let channelId;
  const resLive = await fetch(`/api/lives/${liveId}`);
  const dataLive = await resLive.json();
  console.log(dataLive);
  const liveTitle = document.querySelector('.live-title');
  const channelName = document.querySelector('.channel-name');
  const channelImg = document.querySelector('.channel-img');
  liveTitle.innerText = dataLive.title;
  channelId = dataLive.channel.id;
  console.log('채널아이디', channelId);
  channelName.innerText = dataLive.channel.name;
  const profileImgUrl = dataLive.channel.profileImgUrl || '/img/profile.jpg';
  channelImg.innerHTML = `<img src="${profileImgUrl}" alt="profile_image" class="w-100 border-radius-lg shadow-sm"/>`;
};

// getData();

let socket;

//채팅
const chatroom = (liveId) => {
  const roomId = liveId;
  const chatBtn = document.querySelector('#button-addon2');
  const chatInput = document.querySelector('#chat-input');
  const chatContainerEl = document.querySelector('#chat-container');

  socket = io('/', {
    extraHeaders: {
      'room-id': roomId,
    },
  });

  socket.on('startLive', ({ liveId }) => {
    mediaContainerEl.innerHTML = `
        <video
          id="video"
          width="100%"
          height="100%"
          controls
          autoplay
        ></video>
    `;

    const video = document.getElementById('video');
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

      // hls.on(Hls.Events.ERROR, function (event, data) {
      //   var errorType = data.type;
      //   var errorDetails = data.details;
      //   var errorFatal = data.fatal;

      //   switch (data.details) {
      //     case Hls.ErrorDetails.FRAG_LOAD_ERROR:
      //       // ....
      //       break;
      //     default:
      //       break;
      //   }
      // });
    }, 10000);
  });

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
    console.log(data);
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

  // 시청자수 받기
  const userConutEl = document.querySelector('#user-count');
  socket.on('userCount', (data) => {
    const { userCount } = data;
    userConutEl.innerText = `시청자 ${userCount}` || `시청자 0`;
  });
};

//방송시작버튼 -> 방송종료버튼 / 종료버튼 이벤트 충가
const changeLiveBtn = () => {
  const liveModalBtn = document.getElementById('live-modal-btn');
  const liveUpdateModalBtn = document.getElementById('live-update-modal-btn');

  liveModalBtn.style.display = 'none';
  liveUpdateModalBtn.style.display = '';
};

// 방송 시작
const liveKeyEl = document.querySelector('#live-key');
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
  const liveId = data.id;
  document
    .getElementById('update-save-btn')
    .setAttribute('data-live-id', `${liveId}`);
  getData(liveId);
  chatroom(liveId);
  changeLiveBtn();

  liveKeyEl.insertAdjacentHTML(
    'beforeend',
    ` <i class="fas fa-eye fa-xl" id='key-hide-btn'></i><span id='stream-key'>StreamKey: ${liveId}</span>`,
  );

  //스트림키 숨기기
  const hideBtn = document.getElementById('key-hide-btn');
  hideBtn.addEventListener('click', () => {
    const streamKey = document.getElementById('stream-key');
    if (streamKey.style.display === 'none') {
      streamKey.style.display = '';
    } else {
      streamKey.style.display = 'none';
    }
  });

  socket.emit('createLive');
});

// 방송 정보 변경
const updateSaveBtn = document.getElementById('update-save-btn');
updateSaveBtn.addEventListener('click', async () => {
  const liveId = updateSaveBtn.getAttribute('data-live-id');
  const updateTitleInput = document.getElementById('update-title-input').value;
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
  getData(liveId);
});
