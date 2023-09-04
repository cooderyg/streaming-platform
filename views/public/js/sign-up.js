const nicknameEl = document.querySelector('#nickname');
const emailEl = document.querySelector('#email');
const passwordEl = document.querySelector('#password');
const signupBtn = document.querySelector('#signup-btn');

//회원가입 버튼
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

//이메일 인증버튼
const authEmailBtn = document.getElementById('auth-email-btn');
const certificationForm = document.getElementById('certification-number-form');
const certificationBtn = document.getElementById('certification-number-btn');

authEmailBtn.addEventListener('click', async (e) => {
  if (authEmailBtn.classList.contains('active')) return;
  authEmailBtn.classList.add('active');
  e.preventDefault();
  const emailRes = await fetch('/api/users/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: emailEl.value,
    }),
  });
  const emailData = await emailRes.json();

  authEmailBtn.innerText = '발급완료';
  if (typeof emailData.message === 'number') {
    certificationForm.style.display = '';
    certificationBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const certificationInput = document.getElementById(
        'certification-number-input',
      );

      if (Number(certificationInput.value) === emailData.message) {
        alert('이메일이 인증되었습니다');
        signupBtn.disabled = false;
        certificationBtn.innerText = '인증완료';
        certificationInput.disabled = true;
        certificationBtn.classList.add('active');
        emailEl.disabled = true;
      } else {
        alert('인증번호를 확인해주세요.');
      }
    });
  } else {
    alert(emailData.message);
    authEmailBtn.classList.remove('active');
    authEmailBtn.innerText = '이메일 인증';
  }
});
