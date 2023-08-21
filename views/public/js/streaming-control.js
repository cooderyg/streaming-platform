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

//채팅
const chatroom = (liveId) => {
  const roomId = liveId;
  const chatBtn = document.querySelector('#button-addon2');
  const chatInput = document.querySelector('#chat-input');
  const chatContainerEl = document.querySelector('#chat-container');

  const socket = io('/', {
    extraHeaders: {
      'room-id': roomId,
    },
  });

  chatInput.addEventListener('keydown', (e) => {
    if (e.keyCode === 13) chatBtn.click();
  });

  chatBtn.addEventListener('click', () => {
    if (chatInput.value === '') return alert('채팅을 입력해주세요.');
    socket.emit('chat', {
      chat: chatInput.value,
    });
    chatInput.value = '';
  });

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
const changeLiveBtn = (liveId) => {
  const liveModalBtn = document.getElementById('live-modal-btn');
  const liveOffBtn = document.getElementById('live-off-btn');
  console.log('시작버튼', liveModalBtn);
  console.log('종료버튼', liveOffBtn);
  console.log(liveId);
  liveModalBtn.style.display = 'none';
  liveOffBtn.style.display = '';
  liveOffBtn.addEventListener('click', async () => {
    const res = await fetch(`/api/lives/${liveId}/turn-off`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      // body: JSON.stringify({}),
    });
    const data = await res.json();
    console.log(data);
  });
};

// 방송 시작
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
  const data = await res.json();
  const liveId = data.id;
  document
    .getElementById('update-save-btn')
    .setAttribute('data-live-id', `${liveId}`);
  getData(liveId);
  chatroom(liveId);
  changeLiveBtn(liveId);
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
