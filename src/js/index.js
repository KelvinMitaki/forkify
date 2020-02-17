// Global app controller
import Search from "./models/Search";
import * as searchView from "./views/searchViews";
import { elements, renderLoader, clearLoader } from "./views/base";
import Recipe from "./models/Recipe";
import * as recipeView from "./views/recipeView";
import List from "./models/List";
import * as listView from "./views/listView";
import Likes from "./models/Likes";
import * as likesView from "./views/likesView";
/**
 * GLOBAL STATE OF THE APP
 * search object
 * current recipe object
 * shopping list object
 * liked recipes
 */

const state = {};

/**
 * SEARCH CONTROLLER
 */

const controlSearch = async () => {
  //    get queries from the view
  const query = searchView.getInput();

  if (query) {
    //   * get new search object and add it to the state
    state.search = new Search(query);
    //   * prepare the UI for the results
    searchView.clearInput();
    searchView.clearResult();
    renderLoader(elements.searchRes);
    try {
      //   * search for recipes
      await state.search.getResults();
      //   * render results to the UI
      clearLoader();
      searchView.renderResult(state.search.result);
    } catch (error) {
      alert("Something went wrong with the search");
      clearLoader();
    }

    //   */
  }
};
elements.searchForm.addEventListener("submit", e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener("click", e => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResult();
    searchView.renderResult(state.search.result, goToPage);
  }
});

/**
 * RECIPE CONTROLLER
 */

const controlRecipe = async () => {
  //get ID from the URL
  const id = window.location.hash.replace("#", "");
  console.log(id);
  if (id) {
    //Prepare the UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    //highlight selected search item
    if (state.recipe) searchView.highlightSelected(id);

    //create a new object
    state.recipe = new Recipe(id);

    try {
      //get recipe data and parse ingredients
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      //calculate servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();
      //render the recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
    } catch (error) {
      alert("Something went wrong");
    }
  }
};

window.addEventListener("hashchange", controlRecipe);
window.addEventListener("load", controlRecipe);

/**
 * LIST CONTROLLER
 */
const controlList = () => {
  //create a new list if there is none yet
  if (!state.list) state.list = new List();

  //add each ingredient to the list and the UI
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};
//handle delete and update list item events
elements.shopping.addEventListener("click", e => {
  const id = e.target.closest(".shopping__item").dataset.itemid;
  if (e.target.matches(".shopping__delete, .shopping__delete *")) {
    //delete from the state
    state.list.deleteItem(id);
    //delete from the UI
    listView.deleteItem(id);
  }
});

/**
 * LIKES CONTROLLER
 */

const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;

  //user not yet liked the current recipe
  if (!state.likes.isLiked(currentID)) {
    //add like to the state
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.publisher,
      state.recipe.image_url,
      state.recipe.title
    );
    //toggle the like button
    likesView.toogleLikeButton(true);

    //add like to the UI list
    likesView.renderLike(newLike);
  }
  //user has liked the current recipe
  else {
    //remove like from the state
    state.likes.deleteLike(currentID);

    //toggle the like button
    likesView.toogleLikeButton(false);
    //remove like from the UI
    likesView.deleteLike(currentID);
  }
  likesView.toggleLikesMenu(state.likes.getNumLikes());
};

window.addEventListener("load", () => {
  state.likes = new Likes();

  //restore likes
  state.likes.readStorage();

  //toggle the like menu button depending on whether there are likes
  likesView.toggleLikesMenu(state.likes.getNumLikes());

  //render the existing likes
  state.likes.likes.forEach(like => likesView.renderLike(like));
});

//handling recipe button clicks
elements.recipe.addEventListener("click", e => {
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    //decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("dec");
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    //increase button is clicked
    state.recipe.updateServings("inc");
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
    //add to shopping button is clicked
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    //likes controller
    controlLike();
  }
});
