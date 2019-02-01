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
    $('div.column').sortable({
      connectWith: 'div.column'
    });

    // var droppableParent;
	
    // $('.list').draggable({
    //   revert: 'invalid',
    //   revertDuration: 200,
    //   start: function () {
    //     droppableParent = $(this).parent();
      
    //     $(this).addClass('being-dragged');
    //   },
    //   stop: function () {
    //     $(this).removeClass('being-dragged');
    //   }
    // });
	
    // $('.column').droppable({
    //   tolerance: 'touch',
    //   hoverClass: 'drop-hover',
    //   drop: function (event, ui) {
    //     var draggable = $(ui.draggable[0]),
    //       draggableOffset = draggable.offset(),
    //       container = $(event.target),
    //       containerOffset = container.offset();
        
    //     $('.list', event.target).appendTo(droppableParent).css({opacity: 0}).animate({opacity: 1}, 200);
        
    //     draggable.appendTo(container).css({left: draggableOffset.left - containerOffset.left, top: draggableOffset.top - containerOffset.top}).animate({left: 0, top: 0}, 200);
    //   }
    // });
  

    $('.list-cards').sortable({
      connectWith: '.list-cards'
    });

    $('#datepicker').datepicker();
  }

  function createTabs() {
    $('#tabs').tabs();
  }
  function createDialogs() {
    $('#list-creation-dialog')
      .dialog({
        autoOpen: false,
        position: {
          my: "left top",
          at: "left bottom",
          of: "#new-list",
        },
        show: 'slide',
        hide: 'explode'
      });
    
    $("#card-dialog")
      .dialog({
        autoOpen: false,
        hide: 'fold',
        show: 'blind',
        close: function() {
          $('#tabs-1').empty();
          // $('#tabs-2').empty();
        }
      })
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
    DOM.$cards.on('click', showCard);
  }

  function rebindEvents(event) {
    console.log(event);
    $('.list-header > button.delete').on('click', deleteList);
    $('.card > button.delete').on('click', deleteCard);
    $('form.new-card').unbind();
    $('form.new-card').on('click', createCard);
    $('.card').unbind();
    $('.card').on('click', showCard);
  }

  /* ============== Metoder för att hantera listor nedan ============== */
  function showCreateListDialog(event) {
    event.preventDefault();
    $('#list-creation-dialog')
      .dialog("open");
  }

  function createList(event) {
    event.preventDefault();
    $('#list-creation-dialog')
      .dialog("close");
    let listName = this.elements[0].value;
    let newList = `
    <div class="column">
      <div class="list">
          <div class="list-header">
              ${listName}
              <button class="button delete">X</button>
          </div>
          <ul class="list-cards">
              <li class="card">
                  <span class="card-content">New Card</span>
                  <span class="card-date"></span>
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

    if (listName) {    
      $('.column').last().after(newList);
    }
    setupBoard();
    rebindEvents(event);
  }

  function deleteList() {
    $(this).closest('.column').remove();
  }

  /* =========== Metoder för att hantera kort i listor nedan =========== */
  function createCard(event) {
    event.preventDefault();
    let cardName = this.elements[0].value;
    let newCard = `
    <li class="card">
      <span class="card-content">${cardName}</span>
      <span class="card-date"></span>
      <button class="button delete">X</button>
    </li>`
    if (cardName) {
      $(this).closest('li').before(newCard);
    }
    rebindEvents(event);
  }

  function deleteCard() {
    $(this).closest('.card').remove();
  }

  function showCard(event) {
    let cardDialog = $('#card-dialog');
    console.log($(this));
    let cardText = $(this.firstElementChild).text().trim();
    let cardInput = $(`
    <form class="edit-card-form">
      <input type='text' name='edit-card' value='${cardText}' />
    </form>`);

    $('#tabs-1').append(cardInput);
    cardDialog.dialog("open");
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
