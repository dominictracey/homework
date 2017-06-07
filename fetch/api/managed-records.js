import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

// Your retrieve function plus any additional functions go here ...
function retrieve(req) {
  // transform the pagination params
  const params = parseParams(req)

  // base uri
  var uri = URI(path).search(params)

  // sorry, I couldn't get URI.js to not urlencode the colors
  const colors = req && 'colors' in req ? req.colors : null
  var colorParams = ''
  if (colors) {
    colorParams = colors.map(c => `&color[]=${c}`).join('')
  }

  return new Promise((resolve, reject) => {
    var output = {}
    const page = req && req.page ? req.page : 1
    fetch(uri+colorParams)
      .then(response => {
        // get the response body as JSON
        return response.json()
      })
      .then(json => {
          // transform from the old json to new object
          output.previousPage = getPreviousPage(page)
          output.nextPage = getNextPage(page, json.length == 0)
          output.ids = getIds(json)
          output.open =  getOpen(json)
          output.closedPrimaryCount = getClosedPrimaryCount(json)
          resolve(output)
      })
      .catch(err => {
        console.log('something bad happened: ' + err)
        resolve(err)
      })
   })
}

function parseParams(req) {
  var obj = { limit: 10 }
  obj.offset = req && req.page ? (req.page-1)*10 : 0
  return obj
}

function getIds(json) {
  return json.slice(0,10).map(obj => obj.id)
}

function getOpen(json) {
  return json.filter(obj => obj.disposition == 'open')
              .map(obj => {
                obj.isPrimary = ['red','yellow','blue'].indexOf(obj.color) >= 0
                return obj
              })
}

function getPreviousPage(page=1) {
  return page > 1 ? page - 1 : null
}

function getNextPage(page=1, empty) {
  return page < 50 && !empty ? page + 1 : null
}

function getClosedPrimaryCount(json) {
  return json.reduce((acc,o) => {
    return o.disposition == 'closed' && ['red','yellow','blue'].indexOf(o.color) >= 0 ? acc + 1 : acc
  },0)
}

export default retrieve;
