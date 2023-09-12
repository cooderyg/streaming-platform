const roomId = window.location.pathname.split('/')[2];
const chatBtn = document.querySelector('#button-addon2');
const chatInput = document.querySelector('#chat-input');
const chatContainerEl = document.querySelector('#chat-container');

let user;
let channelId;
let banList = [];
let isUserInBanList;

const getUserData = async () => {
  try {
    const response = await fetch('/api/users');
    if (!response.ok) return;
    const data = await response.json();
    user = data;
  } catch (error) {
    console.error(error);
  }
};
getUserData();

const getChannelId = async () => {
  try {
    const response = await fetch(`/api/lives/${roomId}`);
    if (!response.ok) {
      window.location.href = '/';
      alert('방송을 찾을 수 없습니다.');
    }
    const data = await response.json();
    channelId = data.channel.id;
  } catch (error) {
    console.log(error);
  }
};
getChannelId();

const getBanList = async () => {
  try {
    const response = await fetch(`/api/channel/${channelId}/ban`);
    if (!response.ok) return;
    banList = await response.json();
    isUserInBanList = banList.some((item) => item.user.id === user.id);
  } catch (error) {
    console.log(error);
  }
};
getBanList();

const kickUser = function () {
  if (isUserInBanList) {
    window.location.href = '/';
    alert('블랙리스트 유저입니다');
  }
};
kickUser();

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
  } else if (isUserInBanList) {
    e.currentTarget.blur();
    return alert('채팅이 금지되었습니다.');
  }
});

// 소켓 카운트
let socketCommCount = 0;

// 채팅보내기
chatBtn.addEventListener('click', () => {
  if (isUserInBanList) return alert('채팅이 금지되었습니다.');
  if (!user) return alert('로그인 후 이용해주세요.');
  if (chatInput.value === '') return alert('채팅을 입력해주세요.');
  const abuse = new RegExp(
    /[시씨슈쓔쉬쉽쒸쓉]([0-9]*|[0-9]+ *)[바발벌빠빡빨뻘파팔펄]|[섊좆좇졷좄좃좉졽썅춍]|ㅅㅣㅂㅏㄹ?|ㅂ[0-9]*ㅅ|[ㅄᄲᇪᄺᄡᄣᄦᇠ]|[ㅅㅆᄴ][0-9]*[ㄲㅅㅆᄴㅂ]|[존좉좇][0-9 ]*나|[자보][0-9]+지|보빨|[봊봋봇봈볻봁봍] *[빨이]|[후훚훐훛훋훗훘훟훝훑][장앙]|후빨|[엠앰]창|애[미비]|애자|[^탐]색기|([샊샛세쉐쉑쉨쉒객갞갟갯갰갴겍겎겏겤곅곆곇곗곘곜걕걖걗걧걨걬] *[끼키퀴])|새 *[키퀴]|[병븅]신|미친[가-닣닥-힣]|[믿밑]힌|[염옘]병|[샊샛샜샠섹섺셋셌셐셱솃솄솈섁섂섓섔섘섻]기|섻|[섹섺섻쎅쎆쎇쎽쎾쎿섁섂섃썍썎썏][스쓰]|지랄|니[애에]미|갈[0-9]*보[^가-힣]|[뻐뻑뻒뻙뻨][0-9]*[뀨큐킹낑)|꼬추|곧휴|[가-힣]슬아치|자박꼼|븅|[병븅]딱|빨통|[사싸](이코|가지|까시)|육시[랄럴]|육실[알얼할헐]|즐[^가-힣]|찌(질이|랭이)|찐따|찐찌버거|창[녀놈]|[가-힣]{2,}충[^가-힣]|[가-힣]{2,}츙|부녀자|화냥년|환[양향]년|호[구모]|조[선센][징]|조센|[쪼쪽쪾]([발빨]이|[바빠]리)|盧|무현|찌끄[레래]기|(하악){2,}|하[앍앜]|[낭당랑앙항남담람암함][ ]?[가-힣]+[띠찌]|느[금급]마|文在|在寅|(?<=[^\n])[家哥]|속냐|[tT]l[qQ]kf|Wls/,
  );
  if (abuse.test(chatInput.value)) {
    chatInput.value = '';
    return alert('어허! 예쁜말');
  }
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

// 방 입장시 지난 채팅 30개 받기
async function pastChat(roomId) {
  const chatRes = await fetch(`/api/chats/${roomId}`);
  const chatData = await chatRes.json();
  chatData.forEach((data) => {
    const chat = data.content;
    const nickname = data.nickname;
    const img = '/img/profile.jpg';
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
    chatContainerEl.insertAdjacentHTML('afterbegin', temp);
    chatContainerEl.scrollTop = chatContainerEl.scrollHeight;
  });
}
pastChat(roomId);

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
        src="/img/freelyb-banner.png"
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
  if (donaitonAmount > creditAmount) {
    if (
      confirm(
        '보유하신 크레딧보다 후원금액이 많습니다. 크레딧을 충전 하시겠습니까?',
      )
    ) {
      window.location.href = '/billing';
    }

    return;
  }

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

// 블랙리스트 정보 업데이트
socket.on('ban', () => {
  getUserData();
  getChannelId();
  getBanList();
  kickUser();
});
