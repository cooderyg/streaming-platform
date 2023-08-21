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

const userConutEl = document.querySelector('#user-count');
console.log(userConutEl);
socket.on('userCount', (data) => {
  console.log(data);
  const { userCount } = data;
  console.log(userCount);
  userConutEl.innerText = `시청자 ${userCount}` || `시청자 0`;
});
