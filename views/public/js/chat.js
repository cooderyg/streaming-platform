const roomId = window.location.pathname.split('/')[2];
const chatBtn = document.querySelector('#button-addon2');
const chatInput = document.querySelector('#chat-input');
const chatContainerEl = document.querySelector('#chat-container');

let user;

const getUserData = async () => {
  try {
    const response = await fetch('/api/users');
    // if (!response.ok) return;
    const data = await response.json();
    user = data;
  } catch (error) {
    console.log(error);
  }
};
getUserData();

const socket = io('/', {
  extraHeaders: {
    'room-id': roomId,
  },
});

chatInput.addEventListener('keydown', (e) => {
  if (e.keyCode === 13) chatBtn.click();
});

chatInput.addEventListener('focus', (e) => {
  if (!user) {
    e.currentTarget.blur();
    return alert('로그인 후 이용해주세요.');
  }
});

// 소켓 카운트
let socketCommCount = 0;

// 채팅보내기
chatBtn.addEventListener('click', () => {
  if (!user) return alert('로그인 후 이용해주세요.');
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

// 시청자수 받기
const userConutEl = document.querySelector('#user-count');
socket.on('userCount', (data) => {
  const { userCount } = data;
  userConutEl.innerText = `시청자 ${userCount}` || `시청자 0`;
});

const mediaContainerEl = document.querySelector('#media-container');

socket.on('endLive', () => {
  mediaContainerEl.innerHTML = `
    <img
        src="https://blog.kakaocdn.net/dn/cu6FRS/btrdswyTELB/zgpbDlAoEaTFcCXf2LI0Jk/img.png"
        class="card-img-top"
        alt="..."
      />
  `;
  alert('방송이 종료되었습니다.');
});

// 후원하기
const donationModalBtn = document.querySelector('#donation-modal-btn');
const donationBtn = document.querySelector('#donation-btn');
const closeBtn = document.querySelector('#close-btn');
const creditAmountEl = document.querySelector('#credit-amount');

let creditAmount;

// 후원하기 모달
donationModalBtn.addEventListener('click', async () => {
  const response = await fetch('/api/users');
  const data = await response.json();
  if (!response.ok) {
    if (confirm('로그인 후 이용가능한 기능입니다. 로그인 하시겠습니까?')) {
      window.location.href = '/sign-in';
    } else {
      closeBtn.click();
      return;
    }
  }
  creditAmount = data.credit;
  creditAmountEl.innerText = `${creditAmount} 원`;
});

const donationAmountInputEl = document.querySelector('#donation-amount');

donationAmountInputEl.addEventListener('keydown', (e) => {
  if (e.keyCode === 13) e.preventDefault();
});

// 후원하기 버튼
donationBtn.addEventListener('click', async (e) => {
  e.preventDefault();

  const donaitonAmount = Number(donationAmountInputEl.value);
  if (!donaitonAmount) return alert('금액을 입력해주세요!');
  if (donaitonAmount > creditAmount)
    return alert('보유하신 포인트보다 후원금액이 많습니다.');
  //TODO 프론트 결제기능 만들면 충전하러 갈지 바꾸기
  const form = JSON.stringify({
    amount: donaitonAmount,
    liveId: roomId,
  });
  const response = await fetch('/api/credit-histories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: form,
  });
  if (!response.ok) return alert('후원에 실패했습니다 다시 시도해주세요.');
  const data = await response.json();
  const amount = data.amount;
  if (!socketCommCount) {
    socket.emit('donation', { roomId, amount, user });
    socketCommCount++;
  } else {
    socket.emit('donation', { roomId, amount });
  }
  closeBtn.click();
  donationAmountInputEl.value = '';
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
