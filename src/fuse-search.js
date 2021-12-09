var classes = require('./utils/classes'),
  events = require('./utils/events'),
  extend = require('./utils/extend'),
  toString = require('./utils/to-string'),
  getByClass = require('./utils/get-by-class')

module.exports = function (list, options) {
  options = options || {}

  options = extend(
    {
      searchClass: 'fuse-search',
    },
    options
  )

  var fuseSearch = {
    search: function (searchString, columns) {
      var searchArguments = searchString;
      var searchList = (pattern) => {
        if (!pattern) {
          return [];
        }
        var result = list.fuse.search(pattern);
        var matches = [];
        if(!result.length) {
          return [];
        } else {
          result.forEach(({ item , score}) => {
            matches.push({...item, score});
          });
          return matches;
        }
      }
      var results = searchList(searchArguments); 
      
      if(results.length) {
        console.log('list.items: ' + JSON.stringify(list.items));
        for (var k = 0, kl = list.items.length; k < kl; k++) {
          fuseSearch.item(list.items[k], columns, results)
        }
        
        /*
        this would work to avoid having to loop through the list, but would have to figure out how to set all non-matches to found=false
        results.forEach(({name}) => {
          var i = list.get("name", name)
          console.log('name: ' + name + " item: " + JSON.stringify(i))
        })
        */
      }
    },
    item: function (item, columns, resultsList) {

    /**
     *
     * refer to fuzzy-search.js for optional "columns" variables here, in the future may be useful to let user decide which "column" or Property (in this case "name") should carry more weight in the search
     *
     */
      var found = true;
      var n = item.values().name;
      var match = resultsList.find(({name}) => name === n);
      if(typeof match === 'undefined') {
        found = false;
        item.score = 0;
      } else {
        found = true;
        item.score = match.score;
      }      
      item.found = found;
    }
  }

  events.bind(
    getByClass(list.listContainer, options.searchClass),
    'keyup',
    list.utils.events.debounce(function (e) {
      var target = e.target || e.srcElement // IE have srcElement
      list.search(target.value, fuseSearch.search)
      // console.log('list.matchingItems: ' + JSON.stringify(list.matchingItems));
    }, list.searchDelay)
  )
  return function (str, columns) {
    list.search(str, columns, fuseSearch.search)
  }
}
