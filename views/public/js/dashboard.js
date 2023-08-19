const incomeEl = document.querySelector('#income');
const subscribeEl = document.querySelector('#subscribe');
const livesEl = document.querySelector('#lives');

const getChannelData = async () => {
  const response = await fetch('/api/channels');
  const data = await response.json();

  console.log(data);

  incomeEl.innerText = data.income;
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
  console.log(data);

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
        data.income ? data.income : 0
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
