$(function() {
  var apiUrlBase;

  var apiUrls = {
		    prod: 'https://marketplace.firefox.com',
		    dev: 'https://marketplace-dev.allizom.org',
		    stage: 'https://marketplace.allizom.org',
		    alt: 'https://payments-alt.allizom.org',
		    local: 'http://fireplace.loc',
		  };

  function initApp(env) {
    var itemslist = $('#items ul');
    if (!env) {
       env = $('#server option:selected').val();
    }
    apiUrlBase = apiUrls[env];
    if (!apiUrlBase) {
        throw new Error('unknown API env: ' + env);
    }
    console.log('setting API to', apiUrlBase);

    fxpay.configure({
       apiUrlBase: apiUrlBase
    });

    clearError();
    clearitemsBought();
    itemslist.empty();

    console.log('getting items from', apiUrlBase);

    fxpay.getProducts(function(error, products) {
      if (error) {
        console.error('Error getting products:', error);
        return showError(error);
      }
      products.sort();
      products.forEach(function(productInfo) {
        console.info('Got product:', productInfo);
        addProduct(itemslist, productInfo);
      });
    });
  }

  function clearError() {
	    $('#error').text('');
	  }

  function clearitemsBought() {
	    $('#bought ul li:not(.placeholder)').remove();
	    $('#bought ul li.placeholder').show();
	  }

  function showError(msg) {
	    console.error(msg);
	    $('#error').text(msg);
	  }

  function showStatus(msg) {
	    console.log(msg);
	    $('#log').text(msg);
	  }
  
  function addProduct(parent, prodData, i) {
	    i = i || {showBuy: true};
	    var li = $('<li></li>', {class: 'item'});

	    li.append($('<h4>' + encodeHtmlEntities(prodData.name) + '</h4>'));
	    parent.append(li);
	    li.append($('<img src=' + prodData.smallImageUrl + '/>'));
	    parent.append(li);

	    if (i.showBuy) {
	      li.append($('<button>Buy item!</button>').data({product: prodData}));
	    }
	  }

  function encodeHtmlEntities(str) {
	    return str.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
	      return '&#' + i.charCodeAt(0) + ';';
	    });
	  }

  $('ul').on('click', '.item button', function() {
	    var prod = $(this).data('product');

	    showStatus('Purchasing', prod.name, prod.productId);

	    fxpay.purchase(prod.productId, function(err, info) {
	      if (err) {
	        console.error('Error purchasing product', info.productId,
	                      'message:', err);
	        return showError(err);
	      }
	      console.log('Item:', info.productId, info, 'purchased');
	      itemBought(info);
	    });
	  });

  function itemBought(productInfo) {
	   $('#bought ul li.placeholder').hide();
	   addProduct($('#bought ul'), productInfo, {showBuy: false});
	   showStatus('Item bought', productInfo);
	  }

  $('#server').change(function(evt) {
	    initApp();
	  });

  fxpay.configure({
	  receiptCheckSites: [
	                      'https://receiptcheck.marketplace.firefox.com',
	                      'https://receiptcheck-marketplace-dev.allizom.org',
	                      'https://receiptcheck-marketplace.allizom.org',
	                      'https://marketplace.firefox.com',
	                      'https://receiptcheck-dev.allizom.org',
	                      'https://marketplace-dev.allizom.org',
	                      'https://receiptcheck-payments-alt.allizom.org',
	                      'https://payments-alt.allizom.org',
	                      'http://fireplace.loc',
	                      ]
  	});

  fxpay.init({
    onerror: function(error) {
      console.error('Error during initialization:', error);
      return showError(error);
    },
    oninit: function(msg) {
      showStatus('fxPay initialized without errors', msg);
      initApp();
      showStatus(msg);
    },
    onrestore: function(error, info) {
      if (error) {
        console.error('error restoring product', info.productId,
                      'message:', error);
      }
      itemBought(info);
    }
  });
});
