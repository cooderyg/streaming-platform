// Todo: 채팅, 다시보기, 채널정보, 후원하기 페이지, 알림 연결
const params = window.location.pathname;
const splits = params.split('/');
const liveId = splits[2];

console.log('라이브Id', liveId);
const subscribeBtn = document.getElementById('channel-subscribe-btn');

const getData = async () => {
  // 라이브방송 데이터 조회
  let channelId;
  let noticeId;

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
  channelImg.insertAdjacentHTML(
    'beforeend',
    `<img
            src="${profileImgUrl}"
            alt="profile_image"
            class="w-100 border-radius-lg shadow-sm"
          />`,
  );
};
getData();

// const liveUpdateBtn = document.getElementById('live-update-btn');
// const myInput = document.getElementById('myInput');

// myModal.addEventListener('shown.bs.modal', () => {
//   myInput.focus();
// });

const updateSaveBtn = document.getElementById('update-save-btn');

updateSaveBtn.addEventListener('click', async () => {
  const updateTitleInput = document.getElementById('live-title-input').value;
  const updateTagInput = document.getElementById('live-tag-input').value;
  const tagNames = ['디아블로'];
  console.log('title value', typeof updateTitleInput);
  console.log('tag value', typeof tagNames);
  const res = await fetch(`/api/lives/${liveId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: JSON.stringify({
      title: updateTitleInput,
      tagNames,
    }),
  });
  const data = await res.json();
  console.log(data);
});

//채팅
const roomId = window.location.pathname.split('/')[2];
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
