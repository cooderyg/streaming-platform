const emailEl = document.querySelector('#email');
const passwordEl = document.querySelector('#password');
const signinBtnEl = document.querySelector('#signin-btn');

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
    console.log(data);
    if (data.message === '로그인을 성공적으로 완료하였습니다.') {
      window.location.href = '/';
    } else {
      alert(data.message);
    }
  } catch (error) {
    const message = error.message;
    alert(message);
  }
});
