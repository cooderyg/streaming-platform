let io;
let isFirst = true;
let count = 1;
let lastDiv;
const replayContainer = document.getElementById('replay-container');
const setReplay = (data) => {
  data.forEach((e) => {
    const liveId = e.id;
    const liveTitle = e.title;
    const createdAt = e.createdAt.split('T')[0];
    const thumbnailUrl = e.thumbnailUrl || '../img/freelyb-banner.png';
    const userImageUrl = e.channel.user.imageUrl || '../img/profile.jpg';
    let tags = '';
    e.tags.forEach((arr) => {
      tags += `#${arr.name}`;
    });

    const temp_html = `
    <div class="col-sm-12 mb-4 col-md-4 col-lg-3 replay" data-replay-id=${liveId} style="display:flex; cursor: pointer;">
      <div class="card">
        <div class="card-header p-0 mx-3 mt-3 position-relative z-index-1">
        <a  class="d-block">
          <img src="${thumbnailUrl}" class="img-fluid border-radius-lg"/>
        </a>
      </div>
      <div class="card-body pt-2">
          <div class="author align-items-center pb-4">
            <img src="${userImageUrl}" alt="..." class="avatar shadow" style="border: 1px solid #ccc; border-radius: 100px"/>
              <div class="name ps-3">
                <span>${e.channel.name}</span>
                  <div class="stats">
                    <small>${createdAt}</small>
                  </div>
                </div>
              </div>
            <a class="card-title h5 d-block text-darker" style="color: #344767;">${liveTitle}</a>
          <p class="card-description mb-4">${tags}</p>
        </div>
      </div>
    </div>
`;
    replayContainer.insertAdjacentHTML('beforeend', temp_html);
  });
  const replayEls = document.querySelectorAll('.replay');

  replayEls.forEach((replayEl) => {
    replayEl.addEventListener('click', (e) => {
      const liveId = e.currentTarget.getAttribute('data-replay-id');
      console.log(liveId);
      window.location.href = `/replay/${liveId}`;
    });
  });
};

const getReplays = async () => {
  console.log('겟');
  if (!isFirst) {
    io.disconnect();
  }
  isFirst = false;
  count = 1;

  io = new IntersectionObserver((entries, observer) => {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        count++;
        io.unobserve(lastDiv);
        const ioFetch = async () => {
          try {
            const response = await fetch(
              `/api/lives/replay?page=${count}&size=20`,
            );
            const data = await response.json();

            if (data.length) {
              setReplay(data);
              lastDiv = document.querySelector(
                '#replay-container > div:last-child',
              );
              io.observe(lastDiv);
            }
          } catch (err) {
            console.error(err);
          }
        };
        ioFetch();
      }
    });
  });

  try {
    const resReplay = await fetch(`/api/lives/replay?page=${count}&size=20`);
    const dataReplay = await resReplay.json();
    dataReplay.forEach((e) => {
      const liveId = e.id;
      const liveTitle = e.title;
      const createdAt = e.createdAt.split('T')[0];
      const thumbnailUrl = e.thumbnailUrl || '../img/freelyb-banner.png';
      const userImageUrl = e.channel.user.imageUrl || '../img/profile.jpg';
      console.log(e);
      let tags = '';
      e.tags.forEach((arr) => {
        tags += `#${arr.name}`;
      });

      const temp_html = `
      <div class="col-sm-12 mb-4 col-md-4 col-lg-3 replay" data-replay-id=${liveId} style="display:flex; cursor: pointer;">
        <div class="card">
          <div class="card-header p-0 mx-3 mt-3 position-relative z-index-1">
          <a  class="d-block">
            <img src="${thumbnailUrl}" class="img-fluid border-radius-lg"/>
          </a>
        </div>
        <div class="card-body pt-2">
            <div class="author align-items-center pb-4">
              <img src="${userImageUrl}" alt="..." class="avatar shadow" style="border: 1px solid #ccc; border-radius: 100px"/>
                <div class="name ps-3">
                  <span>${e.channel.name}</span>
                    <div class="stats">
                      <small>${createdAt}</small>
                    </div>
                  </div>
                </div>
              <a class="card-title h5 d-block text-darker" style="color: #344767;">${e.title}</a>
            <p class="card-description mb-4">${tags}</p>
          </div>
        </div>
      </div>
  `;

      replayContainer.insertAdjacentHTML('beforeend', temp_html);
    });
    const replayEls = document.querySelectorAll('.replay');
    replayEls.forEach((replayEl) => {
      replayEl.addEventListener('click', (e) => {
        const liveId = e.currentTarget.getAttribute('data-replay-id');
        window.location.href = `/replay/${liveId}`;
      });
    });
    lastDiv = document.querySelector('#replay-container > div:last-child');
    io.observe(lastDiv);
  } catch (err) {
    console.error(err);
  }
};

getReplays();
