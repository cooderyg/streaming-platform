const incomeEl = document.querySelector('#income');
const subscribeEl = document.querySelector('#subscribe');
const livesEl = document.querySelector('#lives');
const monthlyIncome = document.querySelector('#monthly-income');

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

  subscribeEl.innerText = data.count;
};

getSubscribeData();

const getLiveData = async () => {
  const response = await fetch('/api/lives/admin/sales');
  const data = await response.json();
  const temp = data.map((data) => {
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
    <td class="text-center">
      <span class="text-xs font-weight-bold">working</span>
    </td>
    <td class="align-middle text-center">
      <span class="text-xs font-weight-bold">${date}</span>
    </td>
    <td class="align-middle"></td>
    </tr>
    `;
  });

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
