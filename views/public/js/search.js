const url = new URL(window.location.href);
const queryString = url.searchParams;
const keyword = queryString.get('keyword');
const searchContainerEl = document.querySelector('#search-container');
const replayContainerEl = document.querySelector('#replay-container');
const searchTitleEl = document.querySelector('#search-title');
const liveTitleEl = document.querySelector('#live-title');
const replayTitleEl = document.querySelector('#replay-title');

const getData = async () => {
  const response = await fetch(
    `/api/lives/search/elastic-search?keyword=${keyword}&size=8`,
  );
  const data = await response.json();
  if (!data.hits.hits.length) {
    liveTitleEl.innerText = '';
  }
  console.log(data.hits.hits);
  searchTitleEl.innerText = `"${keyword}"`;
  const temp = data.hits.hits
    .map((el) => {
      const { _source: source } = el;
      const imgTemp = source.thumbnail_url || '../img/freelyb-banner.png';
      const tagsTemp = source.tags
        .split(',')
        .map((tag) => {
          return `<li>${tag}</li>`;
        })
        .join('');
      return `
    <li>
        <a href="/streaming/${source.id}">
            <div class="img-container">
                <img
                src=${imgTemp}
                alt="이미지에요"
                />
            </div>
            <div class="desc-container">
                <h4 class="mb-0 text-lg">${source.channel_name}</h4>
                <p class="mb-0">시청자 수</p>
                <p class="mb-0 font-weight-bold text-lg">${source.title}</p>
                <ul class="tag-container px-0">
                    ${tagsTemp}
                </ul>
            </div>
        </a>
    </li>
    `;
    })
    .join('');
  searchContainerEl.innerHTML = temp;
};
getData();

const getReplayData = async () => {
  const response = await fetch(
    `/api/lives/search/elastic-search/replaies?keyword=${keyword}&size=8`,
  );
  const data = await response.json();
  if (!data.hits.hits.length) {
    replayTitleEl.innerText = '';
  }
  console.log(data.hits.hits);
  const temp = data.hits.hits
    .map((el) => {
      const { _source: source } = el;
      const imgTemp = source.thumbnail_url || '../img/freelyb-banner.png';
      let tagsTemp = '';
      if (source.tags) {
        tagsTemp = source.tags
          .split(',')
          .map((tag) => {
            return `<li>${tag}</li>`;
          })
          .join('');
      }

      return `
              <li>
                  <a href="/replay/${source.id}">
                      <div class="img-container">
                          <img
                          src=${imgTemp}
                          alt="이미지에요"
                          />
                      </div>
                      <div class="desc-container">
                          <h4 class="mb-2 text-lg">${source.channel_name}</h4>
                          <p class="mb-2 font-weight-bold text-lg">${source.title}</p>
                          <ul class="tag-container px-0">
                              ${tagsTemp}
                          </ul>
                      </div>
                  </a>
              </li>
              `;
    })
    .join('');
  replayContainerEl.innerHTML = temp;
};

getReplayData();
