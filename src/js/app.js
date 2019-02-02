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
  let cardsArray = localStorage.getItem('cards') ? JSON.parse(localStorage.getItem('cards')) : [];

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
    $('.list-header > button.delete').on('click', deleteList);
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
      console.log(listsArray);
      $('.column').last().after(newList);
      rebindEvents();
    }
  }

  function createList(event) {
    event.preventDefault();
    $('#list-creation-dialog')
      .dialog("close");
    let listName = this.elements[0].value;
    
    newList(listName);
    setupBoard();
    rebindEvents(event);
    if (listName) {
      listsArray.push(listName);
      localStorage.setItem("lists", JSON.stringify(listsArray));
    }
    console.log(localStorage.getItem("lists"));
  }

  function deleteList() {
    $(this).closest('.column').remove();
  }

  function restoreLists() {
    if (localStorage.getItem('lists')) {
      const listData = JSON.parse(localStorage.getItem('lists'));
      listData.forEach(list => {
        newList(list);
      })
    }
  }

  /* =========== Metoder för att hantera kort i listor nedan =========== */
  function createCard(event) {
    event.preventDefault();
    let inputContent = $(this).find('input');
    let cardName = this.elements[0].value;
    let newCard = `
    <li class="card">
      <span class="card-content">${cardName}</span>
      <span class="card-date"></span>
      <button class="button delete">X</button>
    </li>`

    if (cardName) {
      $(this).closest('li').before(newCard);
      $(this).find('input').val('');
    }
    rebindEvents(event);
  }

  function deleteCard() {
    $(this).closest('.card').remove();
  }

  function showCard(event) {
    $('#tabs-1').empty();
    DOM.$activeCard = $(this);
    console.log(DOM.$activeCard.find(">:first-child").contents());
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
    restoreLists();
    bindEvents();
    // restoreCards();
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
