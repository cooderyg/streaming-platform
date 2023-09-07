const url = new URL(window.location.href);
const queryString = url.searchParams;
const keyword = queryString.get('keyword');
const searchContainerEl = document.querySelector('#search-container');
const searchTitleEl = document.querySelector('#search-title');

const getData = async () => {
  const response = await fetch(`/api/lives/search/keywords?keyword=${keyword}`);
  const data = await response.json();
  searchTitleEl.innerText = `"${keyword}"`;
  const temp = data
    .map((el) => {
      const imgTemp = el.thumbnailUrl || '../img/home-decor-1.jpg';
      const tagsTemp = el.tags
        .map((tag) => {
          return `<li>${tag.name}</li>`;
        })
        .join('');
      return `
    <li>
        <a href="/streaming/${el.id}">
            <div class="img-container">
                <img
                src=${imgTemp}
                alt="이미지에요"
                />
            </div>
            <div class="desc-container">
                <h4 class="mb-0 text-lg">${el.channel.name}</h4>
                <p class="mb-0">${
                  el.channel?.categories[0] || '카테고리 없음'
                }</p>
                <p class="mb-0">시청자 수</p>
                <p class="mb-0">${el.title}</p>
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
