const incomeEl = document.querySelector('#income');
const subscribeEl = document.querySelector('#subscribe');
const livesEl = document.querySelector('#lives');
const monthlyIncome = document.querySelector('#monthly-income');
const playtimeEl = document.querySelector('#playtime');
const chatSearchInputEl = document.querySelector('#chat-search-input');
const chatSearchBtnEl = document.querySelector('#chat-search-start-btn');
const chatSearchOutputEl = document.querySelector('#chat-search-output');

const switchMoneyString = (number) => {
  return `₩ ${number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

const getChannelData = async () => {
  const response = await fetch('/api/channels');
  const data = await response.json();
  incomeEl.innerText = switchMoneyString(data.income);
};

getChannelData();

const getSubscribeData = async () => {
  const response = await fetch('/api/subscribes');
  const data = await response.json();

  subscribeEl.innerText = `${data.count} 명`;
};

getSubscribeData();

const getAllPlayTimes = async () => {
  const response = await fetch('/api/channels/live-times');
  const data = await response.json();

  playtimeEl.innerText = `${data.playtimes || 0} 분`;
};
getAllPlayTimes();

const getLiveData = async () => {
  const response = await fetch('/api/lives/admin/sales');
  const data = await response.json();
  const temp = data
    .map((data) => {
      const date = new Date(data.createdAt).toLocaleDateString();
      return `
    <tr>
    <td>
      <div class="d-flex px-2">
        <div>
          <img
            src="../img/small-logos/logo-spotify.svg"
            class="avatar avatar-sm rounded-circle me-2"
            alt="spotify"
          />
        </div>
        <div class="my-auto">
          <h6 class="mb-0 text-sm">${data.title}</h6>
        </div>
      </div>
    </td>
    <td class="text-center">
      <p class="text-sm font-weight-bold mb-0">${
        data.income ? switchMoneyString(data.income) : switchMoneyString(0)
      }</p>
    </td>

    <td class="align-middle text-center">
      <span class="text-xs font-weight-bold">${date}</span>
    </td>
    <td class="align-middle"></td>
    </tr>
    `;
    })
    .join('');

  livesEl.innerHTML = temp;
};

getLiveData();

// 한달 간 수익 데이터 가져오기
const getMonthlyIncome = async () => {
  const response = await fetch('/api/lives/income/monthly-income');
  const data = await response.json();
  monthlyIncome.textContent = switchMoneyString(data.income);
};
getMonthlyIncome();

const setTemplete = (data) => {
  const result = data.reduce((acc, chat) => {
    return (
      acc +
      `
    <div style="margin-bottom: 10px;">
      <p style="margin-bottom: 0; font-size: 10px;">생성 일자: ${chat.createdAt
        .replace('T', ' ')
        .replace(/\.\d+Z$/, '')}</p>
      <p style="margin-bottom: 0; font-size: 13px;">내용: ${chat.content}</p>
    </div>
    `
    );
  }, '');
  chatSearchOutputEl.insertAdjacentHTML('beforeend', result);
};

let io;
let isFirst = true;
let count = 1;
let lastDiv;
const chatSearch = async () => {
  if (!isFirst) {
    io.disconnect();
  }
  isFirst = false;
  count = 1;
  chatSearchOutputEl.innerHTML = '';
  const email = chatSearchInputEl.value;

  io = new IntersectionObserver((entries, observer) => {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        count++;
        io.unobserve(lastDiv);
        const ioFetch = async () => {
          try {
            const response = await fetch(
              `/api/chats/search/${email}?page=${count}&size=10`,
            );
            const data = await response.json();

            if (data.length) {
              setTemplete(data);
              lastDiv = document.querySelector(
                '#chat-search-output > div:last-child',
              );
              io.observe(lastDiv); // 마지막 div 선택자로 선택해서 넣기
            }
          } catch (err) {
            alert(err);
          }
        };
        ioFetch();
      }
    });
  });

  chatSearchOutputEl.style.display = 'block';
  try {
    const response = await fetch(
      `/api/chats/search/${email}?page=${count}&size=10`,
    );
    const data = await response.json();
    if (data.length === 0) {
      const result = `
                <div style="margin-bottom: 10px;">
                  <p style="margin-bottom: 0; font-size: 13px;">검색 결과가 없습니다.</p>
                </div>
              `;
      chatSearchOutputEl.innerHTML = result;
      return;
    }
    setTemplete(data);
    lastDiv = document.querySelector('#chat-search-output > div:last-child');
    io.observe(lastDiv); // 마지막 div 선택자로 선택해서 넣기
  } catch (err) {
    alert(err);
  }
};
chatSearchBtnEl.addEventListener('click', chatSearch);
