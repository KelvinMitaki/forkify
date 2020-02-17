import { elements } from "./base";

export const getInput = () => elements.searchInput.value;

export const clearInput = () => (elements.searchInput.value = "");

export const clearResult = () => {
  elements.searchResList.innerHTML = "";
  elements.searchResPages.innerHTML = "";
};

export const highlightSelected = id => {
  const newArr = Array.from(document.querySelectorAll(".results__link"));
  newArr.map(el => {
    el.classList.remove("results__link--active");
  });

  document
    .querySelector(`.results__link[href*="${id}"]`)
    .classList.add("results__link--active");
};

export const limitRecipeTitle = (title, limit = 17) => {
  const newArr = [];
  if (title.length > limit) {
    title.split(" ").reduce((acc, cur) => {
      if (acc + cur.length <= limit) {
        newArr.push(cur);
      }
      return acc + cur.length;
    }, 0);
    return `${newArr.join(" ")}...`;
  }
  return title;
};

const renderRecipe = recipe => {
  const markup = `<li>
    <a class="results__link" href="#${recipe.recipe_id}">
        <figure class="results__fig">
            <img src="${recipe.image_url}" alt="${recipe.title}">
        </figure>
        <div class="results__data">
            <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
            <p class="results__author">${recipe.publisher}</p>
        </div>
    </a>
</li>`;

  elements.searchResList.insertAdjacentHTML("beforeend", markup);
};

const createButton = (page, type) => ` 
    <button class="btn-inline results__btn--${type}" data-goto="${
  type === "prev" ? page - 1 : page + 1
}">
<span>Page ${type === "prev" ? page - 1 : page + 1}</span>
      <svg class="search__icon">
          <use href="img/icons.svg#icon-triangle-${
            type === "prev" ? "left" : "right"
          }"></use>
      </svg>
    </button>`;

const renderButtons = (page, numResults, resPerPage) => {
  const pages = Math.ceil(numResults / resPerPage);
  let button;
  if (page === 1 && pages > 1) {
    //render the next button only
    button = createButton(page, "next");
  } else if (page < pages) {
    //render the next and previous button
    button = `${createButton(page, "prev")} ${createButton(page, "next")}`;
  } else if (page === pages && pages > 1) {
    //render the previous button
    button = createButton(page, "prev");
  }

  elements.searchResPages.insertAdjacentHTML("afterbegin", button);
};

export const renderResult = (recipes, page = 1, resultPerPage = 10) => {
  const start = (page - 1) * resultPerPage; //starts at 0 for first page
  const end = page * resultPerPage; //ends at 9 for the first page since its 1*10
  recipes.slice(start, end).forEach(renderRecipe);
  renderButtons(page, recipes.length, resultPerPage);
};
