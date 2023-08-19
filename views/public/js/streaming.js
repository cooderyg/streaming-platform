window.addEventListener('DOMContentLoaded', (event) => {
  fetch(`/api/lives/0bae8e6b-a9c2-4cd0-a71a-094c82ca4fc9`)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      const liveTitle = document.querySelector('.live-title');
      const channelName = document.querySelector('.channel-name');
      const channelImg = document.querySelector('.channel-img');
      console.log(data.channel.imageUrl);
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
    });

  fetch(`api/8870687c-c0c6-4eec-a8b8-60bfa9d174d6/notices`)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      document.querySelector('.channel-notice').innerText = data[0].content;
      document
        .querySelector('.channel-notice-img')
        .insertAdjacentHTML('beforeEnd', `<img src="${data[0].imageUrl}">`);
    });
});
