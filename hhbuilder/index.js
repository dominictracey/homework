// Wire everything up
var addButton = document.getElementsByClassName('add')
addButton[0].onclick = addButtonHandler
addButton[0].type = 'button' // stop reload on each click

// we need to stop the reload that happens automatically on form submission in most browsers
var submitButton = document.getElementsByTagName('button')[1]
submitButton.type='button'
submitButton.onclick = submitButtonHandler

// maintain an array of objects here for submission
var family = []

// turn on debugging output - should parameterize or keep in config
document.getElementsByClassName('debug')[0].style.display = 'block'
debug('initialized')

function addButtonHandler(e) {
  var ageEntered = document.getElementsByName('age')[0].value
  if (!ageEntered || ageEntered != parseInt(ageEntered, 10) || ageEntered < 0) {
    alert ('Bad age, please enter a positive integer.')
    return
  }

  var relationshipEntered = document.getElementsByName('rel')[0].value
  if (!relationshipEntered || relationshipEntered == '') {
    alert ('Must choose a relationship for this person.')
    return
  }

  var smokerEntered = document.getElementsByName('smoker')[0].value
  var newMember = { age: ageEntered,
                    rel: relationshipEntered,
                    smoker: smokerEntered,
                    }
  family.push(newMember)
  debug('added ' + JSON.stringify(newMember))
  refreshFamilyList()
}

/**
** refreshFamilyList - Would be slicker to manage to add and remove on the fly,
**  but just flush and redraw from the global version of the truth.
**/
function refreshFamilyList() {
  // flush
  var list = document.getElementsByClassName('household')[0].innerHTML = ''

  family.map(function(member,i) {
    var node = document.createElement('li')
    var textnode = document.createTextNode(member.rel + ' (' + member.age + ')')
    var deletebutton = document.createElement('button')
    deletebutton.innerHTML = 'delete'
    deletebutton.onclick = function() { deleteEntry(i) }
    node.appendChild(textnode)
    node.appendChild(deletebutton)
    document.getElementsByClassName('household')[0].appendChild(node);
  })

}

/**
** deleteEntry removes the entry from the global version of the truth and
**  triggers a redraw
**/
function deleteEntry(i) {
  family.splice(i,1)
  refreshFamilyList()
  debug('deleted entry at ' + i)
}

/**
** submitButtonHandler - serialize data collected into json and send to rest api or whatever
**/
function submitButtonHandler() {
  var json = JSON.stringify(family)

  debug ('submitting to server: ' + json)
  // submit refreshes most browsers so debug window is cleared, but it's there.
  // ...
}

function debug(mess) {
  document.getElementsByClassName('debug')[0].innerHTML = mess
}
