// Todo: 채팅, 다시보기, 채널정보, 후원하기 페이지, 알림 연결

const subscribeBtn = document.getElementById('channel-subscribe-btn');
console.log(subscribeBtn);

const getChannelData = () => {
  fetch(`/api/lives/0bae8e6b-a9c2-4cd0-a71a-094c82ca4fc9`)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      const liveTitle = document.querySelector('.live-title');
      const channelName = document.querySelector('.channel-name');
      const channelImg = document.querySelector('.channel-img');
      liveTitle.innerText = data.title;
      channelName.innerText = data.channel.name;
      channelImg.insertAdjacentHTML(
        'beforeend',
        `<img
    src="${data.channel.imageUrl}"
    alt="profile_image"
    class="w-100 border-radius-lg shadow-sm"
  />`,
      );
      subscribeBtn.setAttribute('channelId', `${data.channel.id}`);
    });
};
getChannelData();

const getNotice = () => {
  fetch(`api/8870687c-c0c6-4eec-a8b8-60bfa9d174d6/notices`)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      document.querySelector('.channel-notice').innerText = data[0].content;
      document
        .querySelector('.channel-notice-img')
        .insertAdjacentHTML(
          'beforeEnd',
          `<img src="${data[0].imageUrl}" style="max-width: 800px">`,
        );
    });
};
getNotice();

document.querySelector('.notice-btn').addEventListener('click', () => {
  getNotice();
});

subscribeBtn.addEventListener('click', function (event) {
  const channelId = this.getAttribute('data-channel-id');
  fetch('/api/subscribes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channelId,
    }),
  });
  console.log('구독');
});
