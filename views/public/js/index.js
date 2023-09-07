window.addEventListener('DOMContentLoaded', () => {
  fetch(`/api/lives?page=1&size=20`)
    .then((res) => res.json())
    .then((data) => {
      const cardList = document.querySelector('.card-list');
      data.forEach((live) => {
        const streamer = live.channel.name;
        const streamerImg = live.channel.profileImgUrl || '/img/profile.jpg';
        const title = live.title;
        const tagsArray = live.tags;
        const thumbnailUrl = live.thumbnailUrl || '../img/home-decor-1.jpg';
        let tags = '';
        tagsArray.forEach((arr) => {
          tags += `#${arr.name} `;
        });

        let temp_html = `
                          <div class="col-sm-12 mb-4 col-md-4 col-lg-3 stream" data-id=${live.id} style="display:flex; cursor: pointer;">
                            <div class="card">
                              <div class="card-header p-0 mx-3 mt-3 position-relative z-index-1">
                              <a  class="d-block">
                                <img src="${thumbnailUrl}" class="img-fluid border-radius-lg"/>
                              </a>
                            </div>
                            <div class="card-body pt-2">
                              <span class="text-gradient text-primary text-uppercase text-xs font-weight-bold my-2">OnAir</span>
                                <div class="author align-items-center">
                                  <img src="${streamerImg}" alt="..." class="avatar shadow" style="border: 1px solid #ccc; border-radius: 100px"/>
                                    <div class="name ps-3">
                                      <span>${streamer}</span>
                                        <div class="stats">
                                          <small>현재 시청자</small>
                                        </div>
                                      </div>
                                    </div>
                                  <a class="card-title h5 d-block text-darker" style="color: #344767;">${title}</a>
                                <p class="card-description mb-4">${tags}</p>
                              </div>
                            </div>
                          </div>
                      `;
        cardList.insertAdjacentHTML('beforeEnd', temp_html);

        const streamEls = document.querySelectorAll('.stream');
        streamEls.forEach((streamEl) => {
          streamEl.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            window.location.href = `/streaming/${id}`;
          });
        });
      });
    });
});
let count = 1;
window.onscroll = async function (e) {
  //추가되는 임시 콘텐츠
  //window height + window scrollY 값이 document height보다 클 경우,

  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 3) {
    count++;
    const res = await fetch(`/api/lives?page=${count}&size=20`);
    const data = await res.json();
    const cardList = document.querySelector('.card-list');
    data.forEach((live) => {
      const streamer = live.channel.name;
      const streamerImg = live.channel.profileImgUrl || '/img/profile.jpg';
      const title = live.title;
      const tagsArray = live.tags;
      const thumbnailUrl = live.thumbnailUrl || '../img/home-decor-1.jpg';
      let tags = '';
      tagsArray.forEach((arr) => {
        tags += `#${arr.name} `;
      });

      let temp_html = `
                        <div class="col-sm-12 mb-4 col-md-4 col-lg-3 stream" data-id=${live.id} style="display:flex; cursor: pointer;">
                          <div class="card">
                            <div class="card-header p-0 mx-3 mt-3 position-relative z-index-1">
                            <a  class="d-block">
                              <img src="${thumbnailUrl}" class="img-fluid border-radius-lg"/>
                            </a>
                          </div>
                          <div class="card-body pt-2">
                            <span class="text-gradient text-primary text-uppercase text-xs font-weight-bold my-2">OnAir</span>
                              <div class="author align-items-center">
                                <img src="${streamerImg}" alt="..." class="avatar shadow" style="border: 1px solid #ccc; border-radius: 100px"/>
                                  <div class="name ps-3">
                                    <span>${streamer}</span>
                                      <div class="stats">
                                        <small>현재 시청자</small>
                                      </div>
                                    </div>
                                  </div>
                                <a class="card-title h5 d-block text-darker" style="color: #344767;">${title}</a>
                              <p class="card-description mb-4">${tags}</p>
                            </div>
                          </div>
                        </div>
                    `;
      cardList.insertAdjacentHTML('beforeEnd', temp_html);

      const streamEls = document.querySelectorAll('.stream');
      streamEls.forEach((streamEl) => {
        streamEl.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          window.location.href = `/streaming/${id}`;
        });
      });
    });
  }
};
