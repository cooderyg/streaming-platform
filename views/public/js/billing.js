export const priceToString = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
let user;
const creditEl = document.querySelector('#credit');
const getUserData = async () => {
  const response = await fetch('/api/users');
  if (!response.ok) window.location.href = '/sign-in';
  const data = await response.json();
  user = data;
  const creditString = priceToString(data.credit);
  creditEl.innerText = creditString;
};
getUserData();

const paymentContainerEl = document.querySelector('#payment-container');

const getPayments = async () => {
  const response = await fetch('/api/payments');
  const data = await response.json();
  const cancelTemp = `
    <div class="ms-auto text-end">
        <a class="btn btn-link text-danger text-gradient px-3 mb-0" href="javascript:;" >결제취소</a>
    </div>
    `;

  const temp = data
    .map((data) => {
      return `
            <li
            class="list-group-item border-0 d-flex p-4 mb-2 bg-gray-100 border-radius-lg"
        >
            <div class="d-flex flex-column">
            <h6 class="mb-3 text-sm">${
              data.status === 'PAYMENT' ? '결제완료' : '결제취소'
            }</h6>
            <span class="mb-2 text-xs"
                >결제방식:
                <span class="text-dark font-weight-bold ms-sm-2"
                >카카오페이결제</span
                ></span
            >
            <span class="mb-2 text-xs"
                >결제금액:
                <span class="text-dark ms-sm-2 font-weight-bold"
                >${priceToString(data.amount)} 원</span
                ></span
            >
            <span class="text-xs"
                >결제일시:
                <span class="text-dark ms-sm-2 font-weight-bold"
                >${new Date(data.createdAt).toLocaleString()}</span
                ></span
            >
            </div>
            ${data.status === 'PAYMENT' ? cancelTemp : ''}
        </li>  
    `;
    })
    .join('');

  paymentContainerEl.innerHTML = temp;
};
getPayments();

const creditHistoryContainerEl = document.querySelector(
  '#credit-history-container',
);

const getCreditHistory = async () => {
  const response = await fetch('/api/credit-histories');
  const data = await response.json();

  const temp = data
    .map((data) => {
      const imgTemp = data.live.channel.profileImageUrl || '/img/profile.jpg';
      return `
        <li
            class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg"
        >
            <div class="d-flex align-items-center">
            <button
                class="btn btn-icon-only btn-rounded mb-0 me-3 btn-sm d-flex align-items-center justify-content-center"
            >
                <img src=${imgTemp}  style="width: 1.5875rem; height: 1.5875rem; border-radius: 100px;"/>
            </button>
            <div class="d-flex flex-column">
                <h6 class="mb-1 text-dark text-sm">
                    채널명: ${data.live.channel.name}
                </h6>
                <span class="text-xs">
                ${new Date(data.createdAt).toLocaleString()}
                </span>
            </div>
            </div>
            <div
            class="d-flex align-items-center text-success text-gradient text-sm font-weight-bold"
            >
            ${priceToString(data.amount)} 크레딧
            </div>
        </li>
    `;
    })
    .join('');

  creditHistoryContainerEl.innerHTML = temp;
};
getCreditHistory();

const closeBtnEl = document.querySelector('.btn-close');
const paymentAmountInputEl = document.querySelector('#payment-amount');

paymentAmountInputEl.addEventListener('keydown', (e) => {
  if (e.keyCode === 13) e.preventDefault();
});

const requestPay = () => {
  const amount = paymentAmountInputEl.value;
  if (!amount) return alert('결제금액을 정확하게 입력해주세요!');
  if (amount > 100000) return alert('최대 결제금액은 100,000원입니다!');
  const IMP = window.IMP; // 생략 가능
  IMP.init('imp05076841'); // 예: imp00000000a

  IMP.request_pay(
    {
      pg: 'kakaopay',
      pay_method: 'card',
      name: '크레딧 결제',
      amount: paymentAmountInputEl.value, // 숫자 타입
      buyer_email: user.email,
      buyer_name: user.nickname,
      buyer_tel: '010-4242-4242',
      buyer_addr: '서울특별시 강남구 신사동',
      buyer_postcode: '01181',
    },
    function (rsp) {
      // callback
      //rsp.imp_uid 값으로 결제 단건조회 API를 호출하여 결제결과를 판단합니다.
      if (rsp.success) {
        //결제 성공 시 로직

        //백엔드에 데이터 보내주기
        try {
          fetch('/api/payments', {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({
              impUid: rsp.imp_uid,
              amount: rsp.paid_amount,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log(data);
              alert('결제가 성공적으로 완료되었습니다.');
              getUserData();
              closeBtnEl.click();
            });
        } catch (error) {
          console.log(error.message);
        }
      } else {
        //결제 실패 시 로직
        alert('결제에 실패했습니다!! 다시 시도해 주세요!!');
      }
    },
  );
};

const paymentBtnEl = document.querySelector('#payment-btn');
paymentBtnEl.addEventListener('click', requestPay);
