// Load stored preferenced
store = new Object();

function updateStore() {
  chrome.storage.sync.get('urlalias', function (obj) {
    store = new Object();

    // First time, initialize.
    if (obj != null) {
      store = obj.urlalias;
    }

    // Add default keys if empty.
    if (store == null || Object.keys(store).length == 0) {
      store = new Object();
      store["m"] = "https://mail.google.com";
      store["c"] = "https://calendar.google.com";
      store["d"] = "https://drive.google.com";
      chrome.storage.sync.set({ 'urlalias': store});
    }
  });
};
updateStore();

// Checks if 'server' is to be redirected, and executes the redirect.
function doRedirectIfSaved(tabId, match_url) {
  var redirect = store[match_url[0]];

  if (redirect == null) {
    // No strict alias found. Check for dynamic alias

    // Check if we have a matching redirect
    for (var key in store) {
      if (key.startsWith(match_url[0])) {
        // Found the server
        redirect = store[key];
        break;
      }
    }

    if (redirect == null) {
      // Nothing to be done if there are no matching aliases
      return;
    }

    var num_parameters = match_url.length;
  
    for (var i = 1; i < num_parameters; i++) {
      // multi Variable substituion for dynamic alias
      redirect = redirect.replace("###", match_url[i]);
    }
  }

  if (redirect.indexOf('://') < 0) {
    // Add a default protocol if required
    redirect = "http://" + redirect;
  }
  
  chrome.tabs.update(tabId, { url: redirect });
}

// Called when the user changes the url of a tab.
function onTabUpdate(tabId, changeInfo, tab) {
  var url = tab.url;

  var url_protocol_stripped = /^http[s]?:\/\/(.*)/g.exec(url);

  if (url_protocol_stripped != null && url_protocol_stripped.length >= 2) {
    var match_url = url_protocol_stripped[[1]].split("/");
    doRedirectIfSaved(tabId, match_url);
  }
}

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(onTabUpdate);

// Track changes to data object.
chrome.storage.onChanged.addListener(function(changes, namespace) {
  updateStore();
});

if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) === 0;
  };
}
