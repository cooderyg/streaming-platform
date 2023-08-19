window.addEventListener('DOMContentLoaded', (event) => {
  fetch(`/api/lives?page=1&size=20`)
    .then((res) => res.json())
    .then((data) => {
      const cardList = document.querySelector('.card-list');
      data.forEach((live) => {
        const streamer = live.channel.name;
        const streamerImg = live.channel.user.imageUrl;
        const title = live.title;
        const tagsArray = live.tags;
        let tags = '';
        tagsArray.forEach((arr) => {
          tags += `#${arr.name} `;
        });
        // Todo: 스트리머 사진, 방송 썸네일 추가 필요
        // 스트리머 사진 -> 스트리머 페이지 / 썸네일 -> 라이브 화면  링크걸기
        let temp_html = `<div class="col-sm-12 col-md-6 col-lg-4">
                           <div class="card">
                             <div class="card-header p-0 mx-3 mt-3 position-relative z-index-1">
                              <a href="javascript:;" class="d-block">
                                <img src="../img/home-decor-1.jpg" class="img-fluid border-radius-lg"/>
                              </a>
                            </div>
                            <div class="card-body pt-2">
                              <span class="text-gradient text-primary text-uppercase text-xs font-weight-bold my-2">OnAir</span>
                                <div class="author align-items-center">
                                  <img src="${streamerImg}" alt="..." class="avatar shadow"/>
                                    <div class="name ps-3">
                                      <span>${streamer}</span>
                                        <div class="stats">
                                          <small>현재 시청자</small>
                                        </div>
                                      </div>
                                    </div>
                                  <a href="javascript:;" class="card-title h5 d-block text-darker">${title}</a>
                                <p class="card-description mb-4">${tags}</p>
                              </div>
                            </div>
                          </div>`;
        cardList.insertAdjacentHTML('beforeEnd', temp_html);
      });
    });
});
