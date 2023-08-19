console.log('테스트');
const nicknameEl = document.querySelector('#nickname');
const emailEl = document.querySelector('#email');
const passwordEl = document.querySelector('#password');
const signupBtn = document.querySelector('#signup-btn');

signupBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  if (!nicknameEl.value || !emailEl.value || !passwordEl.value) return;

  try {
    const form = JSON.stringify({
      email: emailEl.value,
      password: passwordEl.value,
      nickname: nicknameEl.value,
    });
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: form,
    });
    const data = await response.json();
    console.log(data);
    if (data.message === '유저 생성이 완료되었습니다.') {
      window.location.href = '/sign-in';
    } else {
      alert(data.message);
    }
  } catch (error) {
    const message = error.message;
    alert(message);
  }
});
