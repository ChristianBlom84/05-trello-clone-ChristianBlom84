import $ from 'jquery';

require('webpack-jquery-ui');
import '../css/styles.css';

/**
 * jtrello
 * @return {Object} [Publikt tillgänliga metoder som vi exponerar]
 */

// Här tillämpar vi mönstret reavealing module pattern:
// Mer information om det mönstret här: https://bit.ly/1nt5vXP
const jtrello = (function() {
  "use strict"; // https://lucybain.com/blog/2014/js-use-strict/

  // Referens internt i modulen för DOM element
  let DOM = {};

  /* =================== Privata metoder nedan ================= */
  function captureDOMEls() {
    DOM.$board = $('.board');
    DOM.$listDialog = $('#list-creation-dialog');
    DOM.$newListForm = $('#list-creation-dialog > form');
    DOM.$columns = $('.column');
    DOM.$lists = $('.list');
    DOM.$cards = $('.card');
    
    DOM.$newListButton = $('button#new-list');
    DOM.$deleteListButton = $('.list-header > button.delete');

    DOM.$newCardForm = $('form.new-card');
    DOM.$deleteCardButton = $('.card > button.delete');
  }

  function setupBoard() {
    $('.board').sortable();
    $('.list').sortable();
  }

  function createTabs() {}
  function createDialogs() {
    $('#list-creation-dialog')
      .dialog({
        autoOpen: false,
        position: {
          my: "left top",
          at: "left bottom",
          of: "#new-list",
        }
      });
  }

  /*
  *  Denna metod kommer nyttja variabeln DOM för att binda eventlyssnare till
  *  createList, deleteList, createCard och deleteCard etc.
  */
  function bindEvents() {
    DOM.$newListButton.on('click', showCreateListDialog);
    DOM.$newListForm.submit(createList);
    DOM.$deleteListButton.on('click', deleteList);

    DOM.$newCardForm.on('submit', createCard);
    DOM.$deleteCardButton.on('click', deleteCard);
  }

  /* ============== Metoder för att hantera listor nedan ============== */
  function showCreateListDialog(event) {
    event.preventDefault();
    // console.log(DOM.$newListForm);
    $('#list-creation-dialog')
      .dialog("open");
  }

  function createList(event) {
    event.preventDefault();
    $('#list-creation-dialog')
      .dialog("close");
    let inputs = this.elements;
    let newList = `
<div class="column">
  <div class="list">
      <div class="list-header">
          ${inputs[0].value}
          <button class="button delete">X</button>
      </div>
      <ul class="list-cards">
          <li class="card">
              New Card
              <button class="button delete">X</button>
          </li>
          <li class="add-new">
              <form class="new-card" action="index.html">
                  <input type="text" name="title" placeholder="Please name the card" />
                  <button class="button add">Add new card</button>
              </form>
          </li>
      </ul>
  </div>
</div>`
    $('.column').last().before(newList);
    $('.list-header > button.delete').on('click', deleteList);
    setupBoard();
  }

  function deleteList() {
    $(this).closest('.column').remove();
  }

  /* =========== Metoder för att hantera kort i listor nedan =========== */
  function createCard(event) {
    event.preventDefault();
    console.log("This should create a new card");
  }

  function deleteCard() {
    console.log(this);
  }

  // Metod för att rita ut element i DOM:en
  function render() {}

  /* =================== Publika metoder nedan ================== */

  // Init metod som körs först
  function init() {
    console.log(':::: Initializing JTrello ::::');
    // Förslag på privata metoder
    captureDOMEls();
    createTabs();
    createDialogs();
    setupBoard();
    bindEvents();
  }

  // All kod här

  return {
    init: init
  };
})();

//usage
$("document").ready(function() {
  jtrello.init();
});
