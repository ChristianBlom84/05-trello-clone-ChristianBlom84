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
  
  let listsArray = localStorage.getItem('lists') ? JSON.parse(localStorage.getItem('lists')) : [];
  let cardsObject = localStorage.getItem('cards') ? JSON.parse(localStorage.getItem('cards')) : {};

  /* =================== Privata metoder nedan ================= */
  
  $.widget( "blom.bgcolor", {
    _create: function() {
        var bgColor = "red";
        this.element
            .css("background", bgColor);
        this._on( this.element, {
          click: "random"
        });
    },
    random: function (event) {
      var colorSelection = ['red', 'green', 'blue', 'cyan', 'grey', 'aliceblue'];
      var bgColor = colorSelection[Math.floor(Math.random() * colorSelection.length)];
      this.element
        .css("background", bgColor);
    }
  });

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
    DOM.$cardDialog = $('#card-dialog');
    DOM.$activeCard;
  }

  function setupBoard() {
    $('div.column').sortable({
      connectWith: 'div.column'
    });

    $('.list').last().bgcolor();

    $('.list-cards').sortable({
      connectWith: '.list-cards'
    });

    $('#datepicker').datepicker({
      onSelect: function(dateText, instance) {
        DOM.$activeCard.find('.card-date')
          .text(dateText);
      }
    });
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
    $('.list-header > button.delete').unbind();
    $('.list-header > button.delete').on('click', deleteList);
    $('.card > button.delete').unbind('click', deleteCard);
    $('.card > button.delete').on('click', deleteCard);
    $('form.new-card').unbind();
    $('form.new-card').on('submit', createCard);
    $('.card').unbind();
    $('.card').on('click', showCard);
  }

  /* ============== Metoder för att hantera listor nedan ============== */
  function showCreateListDialog(event) {
    event.preventDefault();
    $('#list-creation-dialog')
      .dialog("open");
  }

  function newList(listName) {
    let newList = `
    <div class="column">
      <div class="list">
          <div class="list-header">
              <span class="list-title">${listName}</span>
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
      rebindEvents();
    }
  }

  function createList(event) {
    event.preventDefault();
    let inputContent = $(this).find('input');
    $('#list-creation-dialog')
      .dialog("close");
    let listName = this.elements[0].value;
    
    newList(listName);
    setupBoard();
    rebindEvents(event);
    if (listName) {
      inputContent.val('');
      listsArray.push(listName);
      localStorage.setItem("lists", JSON.stringify(listsArray));
    }
  }

  function deleteList(event) {
    let deletedList = $(this).prev('.list-title').text();
    $(this).closest('.column').remove();
    let localLists = JSON.parse(localStorage.getItem('lists'));
    for (let i = 0; i < localLists.length; i++) {
      if (localLists[i] === deletedList) {
        localLists.splice(i, 1);
        localStorage.setItem('lists', JSON.stringify(localLists));
        break;
      };
    };
  }

  function restoreLists() {
    if (JSON.parse(localStorage.getItem('lists'))) {
      const listData = JSON.parse(localStorage.getItem('lists'));
      listData.forEach(list => {
        newList(list);
      });
    }
  }

  /* =========== Metoder för att hantera kort i listor nedan =========== */
  function newCard(cardName, listObject = null) {
    let newCard = `
    <li class="card">
      <span class="card-content">${cardName}</span>
      <span class="card-date"></span>
      <button class="button delete">X</button>
    </li>`
    if (cardName) {
      $(listObject).closest('li.add-new').before(newCard);
      rebindEvents();
    }
  }
  
  function createCard(event) {
    event.preventDefault();
    let inputContent = $(this).find('input');
    let cardName = this.elements[0].value;
    newCard(cardName, $(this));
    if (cardName) {
      $(inputContent).val('');
      let listName = $(this).closest('.list').find('.list-title').text();
      cardsObject[listName] = cardName;
      localStorage.setItem("cards", JSON.stringify(cardsObject));
    }
    rebindEvents(event);
  }

  function deleteCard() {
    let listName = $(this).closest('.list').find('.list-title').text();
    let cardName = $(this).closest('.card').find('.card-content').text();
    $(this).closest('.card').remove();
    let localCards = JSON.parse(localStorage.getItem('cards'));
    $.each(localCards, (index, value) => {
      if (index === listName && value === cardName) {
        delete localCards[index];
        localStorage.setItem('cards', JSON.stringify(localCards));
      }
    })
  }

  function showCard(event) {
    $('#tabs-1').empty();
    DOM.$activeCard = $(this);
    let cardText = $(this.firstElementChild).text().trim();
    let cardInput = $(`
    <form class="edit-card-form">
      <textarea name='edit-card'>${cardText}</textarea>
      <button type="submit">Update</button>
    </form>`);

    $('#tabs-1').append(cardInput);
    DOM.$cardDialog.dialog("open");
    $('form.edit-card-form').on('submit', function(event) {
      event.preventDefault();
      DOM.$activeCard.find(">:first-child").text(event.currentTarget[0].value);
    });
  }

  function restoreCards() {
    if (JSON.parse(localStorage.getItem('cards'))) {
      const cardData = JSON.parse(localStorage.getItem('cards'));

      $.each(cardData, (index, value) => {
        let listSpan = $("span").filter(function() { return ($(this).text() === index) });
        let listObject = $(listSpan).closest('.list').find('li.add-new');
        newCard(value, listObject);
      });
    };
    // TODO: Restore deadline date as well.
  }

  /* =================== Publika metoder nedan ================== */

  // Init metod som körs först
  function init() {
    captureDOMEls();
    createTabs();
    createDialogs();
    restoreLists();
    restoreCards();
    setupBoard();
    bindEvents();
  }

  return {
    init: init
  };
})();

//usage
$("document").ready(function() {
  jtrello.init();
});
