/*
MIT License

Copyright (c) 2018 Eugene Lapeko

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

"use strict";

// Remove unneeded elements from HTML to allow jQuery to parse it.
function sanitizeHTML(html){
  return html.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/ig, '')
}

function snakeToCamelCase(str){
  return str.replace(
    /[-_][a-zA-Z]+/g,
    function(word, index){ return word.charAt(1).toUpperCase() + word.slice(2).toLowerCase(); }
  );
}

function markBodyWithBrowser(){
  $("body").addClass(
    /firefox/.test(navigator.userAgent.toLowerCase())
      ? "ff"
      : "gc"
  );
}

// Get data from chrome.storage.local and return Promise
function getStorageLocal(request){
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(
      request,
      (result) => { resolve(result); }
    );
  });
}

function isOptionTruePromise(optionName){
  return new Promise((resolve, reject) => {
    isOptionTrue(optionName) ? resolve() : reject();
  });
}

function isOptionTrue(optionName, defaultVal = false){
  var val = localStorage.getItem(optionName);
  if (val == null || val == undefined) val = defaultVal;
  return ENEXT.parseBoolean(val);
}

// Check if current domain is in disable list or not
function isDomainEnabled(){
  return getStorageLocal({ 'deniedDomains': "" })
    .then(
      function(result){
        var domains = result.deniedDomains.split("|");
        return new Promise((resolve, reject) => {
          if (domains.includes(location.hostname)){
            reject(new Error("Disabled domain"))
          } else {
            resolve();
          }
        });
      }
    );
}

// delete duplicate array elements
function uniq_fast(array) {
      var seen = {};
      var out = [];
      var i = 0, j = 0;
      for(i = 0; i < array.length; i++) {
        var item = array[i];
        if(seen[item] !== 1) {
          seen[item] = 1;
          out[j++] = item;
        }
      }
      for(j = 0; j < out.length; j++) {
        var count = 0;
        for (i = 0; i < array.length; i++) {
          if (out[j] == array[i]) {
            count++;
          }
        }
        (count > 1) ? out[j] += ' (' + count + ')' : '';
      }
      return out;
  }

  function getUrlVars()
  {
      var vars = [], hash;
      var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
      for(var i = 0; i < hashes.length; i++)
      {
          hash = hashes[i].split('=');
          vars.push(hash[0]);
          vars[hash[0]] = hash[1];
      }
      return vars;
  }
