
import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import axios from 'axios';

const inputSearchImages = document.querySelector('.input-search');
const formSearchImages = document.getElementById('search-form');
const gallery = document.getElementById('gallery');
const loadMoreButton = document.querySelector('.load-more-button');
const endMessage = document.querySelector('.end-message');
let lightbox;


let currentPage = 1;
let loadedImages = [];
let currentKeyword = '';

formSearchImages.addEventListener('submit', async function (event) {
  event.preventDefault();
  currentPage = 1;
  loadedImages = [];
  const keyword = inputSearchImages.value.trim();

  if (keyword) {
    showLoadingSpinner();
    if (keyword !== currentKeyword) {
      currentKeyword = keyword;
      clearGallery();
    }
    await searchImages(keyword, currentPage);
  } else {
    iziToast.error({
      title: 'Error',
      message: 'Please enter a search keyword.',
    });
  }
});

loadMoreButton.addEventListener('click', async function () {

  const keyword = inputSearchImages.value.trim();
  if (keyword !== currentKeyword) {
    lightbox = new SimpleLightbox('a[data-lightbox="gallery"]');
    lightbox.refresh();
    clearGallery();
    currentPage++;
    showLoadingSpinner();
  }
  await searchImages(keyword, currentPage);
});

async function searchImages(keyword, page) {
  try {
    const response = await axios.get(`https://pixabay.com/api/?key=29942317-e3405ade5aa33d4d063a2fbeb&q=${keyword}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=15`);
    const totalHits = response.data.totalHits;
const totalPages = totalHits / 15;
    hideLoadingSpinner();

    if (response.data.hits.length > 0) {
      const newImages = response.data.hits;
      loadedImages = loadedImages.concat(newImages);

      renderImages(loadedImages);

      const lastImage = document.querySelector('.gallery a:last-child');
      const sizeImage = document.querySelector('.gallery a');
      if (lastImage) {
        const lastImageRect = lastImage.getBoundingClientRect();
        const imageRect = sizeImage.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const scrollDistance = lastImageRect.bottom - windowHeight - imageRect.height * 4;
        window.scrollBy({
          top: scrollDistance,
          behavior: 'smooth',
        });
      }

      loadMoreButton.style.display = 'block';
    } else {
      loadMoreButton.style.display = 'none';
      endMessage.style.display = 'block';
    }
  } catch (error) {
    hideLoadingSpinner();
    console.log(error);
  }
}

function clearGallery() {
  gallery.innerHTML = '';
}

function showLoadingSpinner() {
  gallery.innerHTML = '<p>Loading images, please wait...</p>';
}

function hideLoadingSpinner() {
  gallery.innerHTML = '';
}

function renderImages(images) {
  const lightboxImages = [];
  const imageList = images.map((image) => {
    lightboxImages.push({
      src: image.largeImageURL,
      title: `Likes: ${image.likes}, Views: ${image.views}, Comments: ${image.comments}, Downloads: ${image.downloads}`,
    });
    return `<a href="${image.largeImageURL}" data-lightbox="gallery" data-title="${image.tags}">
              <img src="${image.webformatURL}" alt="${image.tags}">
              <ul>
                <li>Likes:<br /> ${image.likes}</li>
                <li>Views:<br /> ${image.views}</li>
                <li>Comments:<br /> ${image.comments}</li>
                <li>Downloads:<br /> ${image.downloads}</li>
              </ul>
            </a>`;
  }).join('');

  gallery.innerHTML += imageList;

  lightbox = new SimpleLightbox('a[data-lightbox="gallery"]');
  lightbox.refresh();
}

