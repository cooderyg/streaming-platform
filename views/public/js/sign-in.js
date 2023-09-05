const emailEl = document.querySelector('#email');
const passwordEl = document.querySelector('#password');
const signinBtnEl = document.querySelector('#signin-btn');
const kakaoLoginBtnEl = document.querySelector('#kakao-login-btn');
const googleLoginBtnEl = document.querySelector('#google-login-btn');

passwordEl.addEventListener('keydown', (e) => {
  if (e.keyCode === 13) signinBtnEl.click();
});

signinBtnEl.addEventListener('click', async (e) => {
  e.preventDefault();
  if (!emailEl.value || !passwordEl.value) return;

  try {
    const form = JSON.stringify({
      email: emailEl.value,
      password: passwordEl.value,
    });
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: form,
    });

    const data = await response.json();
    if (data.message === '로그인을 성공적으로 완료하였습니다.') {
      const redirect = window.localStorage.getItem('redirect');
      window.location.href = redirect;
    } else {
      alert(data.message);
    }
  } catch (error) {
    const message = error.message;
    alert(message);
  }
});

kakaoLoginBtnEl.addEventListener('click', async (e) => {
  window.location.href = '/api/auth/login/kakao';
});

googleLoginBtnEl.addEventListener('click', async (e) => {
  window.location.href = '/api/auth/login/google';
});
