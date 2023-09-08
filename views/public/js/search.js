const url = new URL(window.location.href);
const queryString = url.searchParams;
const keyword = queryString.get('keyword');
const searchContainerEl = document.querySelector('#search-container');
const searchTitleEl = document.querySelector('#search-title');

const getData = async () => {
  const response = await fetch(
    `/api/lives/search/elastic-search?keyword=${keyword}`,
  );
  const data = await response.json();
  console.log(data.hits.hits);
  searchTitleEl.innerText = `"${keyword}"`;
  const temp = data.hits.hits
    .map((el) => {
      const { _source: source } = el;
      const imgTemp = source.thumbnailUrl || '../img/home-decor-1.jpg';
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
                <p class="mb-0">${source?.category_name || '카테고리 없음'}</p>
                <p class="mb-0">시청자 수</p>
                <p class="mb-0">${source.title}</p>
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
