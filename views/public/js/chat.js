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
  const temp = `
  <p style="margin:1px; padding:0px; font-size: 14px;">${chat}</p>
  `;
  chatContainerEl.insertAdjacentHTML('beforeend', temp);
  chatContainerEl.scrollTop = chatContainerEl.scrollHeight;
});
