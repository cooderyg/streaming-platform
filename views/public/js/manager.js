const managersEl = document.querySelector('#managers');

const getData = async () => {
  const response = await fetch('/api/channels/admin/managers');
  const data = await response.json();

  const temp = data.map((data) => {
    const createDate = new Date(data.createdAt).toLocaleDateString();
    const image = data.imageUrl ? data.imageUrl : '/img/profile.jpg';
    return `
    <tr>
        <td>
        <div class="d-flex px-2 py-1">
            <div>
            <img
                src="${image}"
                class="avatar avatar-sm me-3 border"
                alt="user1"
            />
            </div>
            <div
            class="d-flex flex-column justify-content-center"
            >
            <h6 class="mb-0 text-sm">${data.nickname}</h6>
            <p class="text-xs text-secondary mb-0">
                ${data.email}
            </p>
            </div>
        </div>
        </td>
        <td>
        <p class="text-xs font-weight-bold mb-0">Manager</p>
        <p class="text-xs text-secondary mb-0">
            Organization
        </p>
        </td>
        <td class="align-middle text-center text-sm">
        <span class="badge badge-sm bg-gradient-success"
            >Online</span
        >
        </td>
        <td class="align-middle text-center">
        <span class="text-secondary text-xs font-weight-bold"
            >${createDate}</span
        >
        </td>
        <td class="align-middle">
        <a
            data-id=${data.id}
            href="javascript:;"
            class="text-secondary font-weight-bold text-xs p-2 delete-btn"
            data-toggle="tooltip"
            data-original-title="Edit user"
        >
            해임하기
        </a>
        </td>
    </tr>
    `;
  });

  managersEl.innerHTML = temp;
};
getData();

// 매니저 삭제

managersEl.addEventListener('click', async (e) => {
  if (!e.target.classList.contains('delete-btn')) return;
  if (!confirm('정말로 해임하시겠습니까?')) return;

  const managerId = e.target.getAttribute('data-id');

  const form = JSON.stringify({ managerId });
  const response = await fetch(`/api/channels/manager-subtraction`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: form,
  });
  const data = await response.json();
  if (data.ok) {
    window.location.reload();
  } else {
    alert(data.message);
  }
});

// 매니저 생성
const managerBtnEl = document.querySelector('#manager-btn');
const emailEl = document.querySelector('#email');

managerBtnEl.addEventListener('click', async (e) => {
  e.preventDefault();
  const email = emailEl.value;
  if (!email) return alert('이메일을 입력해주세요.');

  const form = JSON.stringify({ email });
  const response = await fetch(`/api/channels/manager-addition`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: form,
  });
  //   const data = await response.json();
  if (!response.ok) {
    alert('임명에 실패했습니다. 다시 확인해주세요.');
  } else {
    window.location.reload();
  }
});
