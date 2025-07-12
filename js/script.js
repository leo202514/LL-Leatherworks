//javascript file for LL Leather Works.

$(document).ready(function () {
  // Local Storage Helper Functions.
  function getStoredData(key) {
    try {
      const dataJSON = localStorage.getItem(key);
      return dataJSON ? JSON.parse(dataJSON) : [];
    } catch (e) {
      console.error('Error parsing data from localStorage for key:', key, e);
      return []; // Return empty array on parse error.
    }
  }

  function setStoredData(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving data to localStorage for key:', key, e);
    }
  }

  // Save for Later functionality.
  $('.save-for-later-btn').on('click', function () {
    const $itemElement =
      $(this).closest('.gallery-item') || $(this).closest('.index-item');
    if ($itemElement.length) {
      const itemId = $itemElement.data('id');
      const itemTitle = $itemElement.data('title');
      const itemImageSrc = $itemElement.find('img').attr('src') || '';

      let savedItems = getStoredData('savedItems');
      const isAlreadySaved = savedItems.some((item) => item.id === itemId);

      if (!isAlreadySaved) {
        savedItems.push({ id: itemId, title: itemTitle, imgSrc: itemImageSrc });
        setStoredData('savedItems', savedItems);
        alert(
          `Item saved! You now have ${savedItems.length} items in your "Save for later" folder.`
        );
      } else {
        alert('This item is already in your "Save for later" folder.');
      }
    }
  });

  // Display Saved Items functionality.
  function displaySavedItems() {
    const $savedItemsListDiv = $('#saved-items-list');
    if ($savedItemsListDiv.length) {
      const savedItems = getStoredData('savedItems');

      if (savedItems.length === 0) {
        $savedItemsListDiv.html('<p>No items saved yet.</p>');
      } else {
        $savedItemsListDiv.empty();
        savedItems.forEach((item) => {
          const $itemDiv = $('<div>')
            .addClass('saved-item')
            .attr('data-id', item.id);

          let itemContent = `<h3>${item.title}</h3>`;
          if (item.imgSrc) {
            const relativeImgSrc = item.imgSrc.includes('images/')
              ? `images/${item.imgSrc.split('images/')[1]}`
              : item.imgSrc;
            itemContent += `<img src="${relativeImgSrc}" alt="${item.title}" style="max-width: 200px; height: auto; display: block; margin-bottom: 10px;">`;
          }
          itemContent += `<button class="remove-saved-btn">Remove</button>`;
          $itemDiv.html(itemContent);
          $savedItemsListDiv.append($itemDiv);
        });

        $('.remove-saved-btn').on('click', function () {
          const $itemToRemoveDiv = $(this).closest('.saved-item');
          if ($itemToRemoveDiv.length) {
            const itemIdToRemove = $itemToRemoveDiv.data('id');
            let savedItems = getStoredData('savedItems');
            const updatedSavedItems = savedItems.filter(
              (item) => item.id !== itemIdToRemove
            );
            setStoredData('savedItems', updatedSavedItems);
            $itemToRemoveDiv.remove();
            if (updatedSavedItems.length === 0) {
              $savedItemsListDiv.html('<p>No items saved yet.</p>');
            }
            alert(
              `Item removed. You now have ${updatedSavedItems.length} items in your "Save for later" folder.`
            );
          }
        });
      }
    }
  }

  if (window.location.pathname.includes('saved.html')) {
    displaySavedItems();
  }

  // Functions for Like Persistence.
  function loadLikedStates() {
    const likedItems = getStoredData('likedItems');
    likedItems.forEach(function (likedItemId) {
      const $likedItem = $(`[data-id="${likedItemId}"]`);
      if ($likedItem.length) {
        const $likeButton = $likedItem.find('.like-btn');
        const $likeConfirmation = $likeButton.siblings('.like-confirmation');

        // Apply liked state.
        $likeButton.addClass('liked').prop('disabled', true);
        $likeConfirmation.show(); // Ensure confirmation is visible.
        $likeButton.hide(); // Hide the button itself if confirmation is shown.
      }
    });
  }

  // Like button functionality.
  $('.like-btn').on('click', function () {
    const $thisButton = $(this);
    const $likeConfirmation = $thisButton.siblings('.like-confirmation');
    const $itemElement = $thisButton.closest('.gallery-item');
    const itemId = $itemElement.data('id');

    if (!$thisButton.hasClass('liked')) {
      let likedItems = getStoredData('likedItems');
      if (!likedItems.includes(itemId)) {
        likedItems.push(itemId);
        setStoredData('likedItems', likedItems);

        $thisButton.addClass('liked');
        $thisButton.prop('disabled', true);

        $thisButton.fadeOut(200, function () {
          $likeConfirmation.fadeIn(400);
        });
      }
    }
  });

  // Single Dropdown Menu Functionality .
  $('.dropdown').hover(
    function () {
      $(this).find('.dropdown-content').stop(true, true).slideDown(200);
    },
    function () {
      $(this).find('.dropdown-content').stop(true, true).slideUp(200);
    }
  );

  // Custom Comment Modal Functionality.
  const $commentModal = $('#commentModal');
  const $closeButton = $('.close-button');
  const $commentForm = $('#commentForm');
  const $commenterNameInput = $('#commenterName');
  const $commentTextarea = $('#commentText');
  const $modalItemIdInput = $('#modalItemId');

  // Function to load comments from Local Storage.
  function loadComments() {
    $('.gallery-item').each(function () {
      const itemId = $(this).data('id');
      const $commentsSection = $(`#comments-${itemId}`);
      const storedComments = getStoredData(`comments_${itemId}`);

      if (storedComments.length === 0) {
        $commentsSection.html(
          '<p class="no-comments-message">No comments yet.</p>'
        );
      } else {
        $commentsSection.empty();
        storedComments.forEach((comment) => {
          const $commentDiv = $('<div>').addClass('comment');
          $commentDiv.html(
            `<span class="commenter-name">${comment.name}:</span> <span class="comment-text">${comment.comment}</span>`
          );
          $commentsSection.append($commentDiv);
        });
      }
    });
  }

  // Event listener for opening the modal.
  $('.add-comment-btn').on('click', function () {
    const itemId = $(this).data('item-id');
    $modalItemIdInput.val(itemId);
    $commenterNameInput.val('');
    $commentTextarea.val('');
    $commentModal.fadeIn(300);
  });

  // Event listener for closing the modal with the 'x' button.
  $closeButton.on('click', function () {
    $commentModal.fadeOut(300);
  });

  // Event listener for closing the modal when clicking outside.
  $(window).on('click', function (event) {
    if ($(event.target).is($commentModal)) {
      $commentModal.fadeOut(300);
    }
  });

  // Event listener for comment form submission.
  $commentForm.on('submit', function (event) {
    event.preventDefault();

    const itemId = $modalItemIdInput.val();
    const commenterName = $commenterNameInput.val().trim();
    const commentText = $commentTextarea.val().trim();

    if (commenterName && commentText) {
      const newComment = { name: commenterName, comment: commentText };

      let storedComments = getStoredData(`comments_${itemId}`);
      storedComments.push(newComment);
      setStoredData(`comments_${itemId}`, storedComments);

      const $commentsSection = $(`#comments-${itemId}`);
      $commentsSection.find('.no-comments-message').remove();

      const $commentDiv = $('<div>').addClass('comment');
      $commentDiv.html(
        `<span class="commenter-name">${commenterName}:</span> <span class="comment-text">${commentText}</span>`
      );
      $commentsSection.append($commentDiv);

      $commentModal.fadeOut(300);
      alert('Comment added successfully!');
    } else {
      alert('Please enter both your name and a comment.');
    }
  });

  // Initial Loads on appropriate pages
  if (window.location.pathname.includes('gallery.html')) {
    loadComments();
    loadLikedStates();
  }
});
