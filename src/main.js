import { streetImages } from "./data"

/*
---------------------------- TIMELINE ----------------------------

  1.- Fetch all HTML nodes to conditionally style later on

  2.- Declare global vars: the shuffled captcha objects & selected grids tracker

  3.- Attach event listeners to square grids, buttons, and icons to enable click functionality

  4.- Initialize the first captcha grid instance

  5.- When a square grid is selected: update its styling and the selected grids tracker var

  6.- When the action button is clicked: either run the game logic or render new next captcha object
  6.1.- Game logic: loop through all squares, check if it's a correct answer or not, display final grid styling based on final answer
  6.2.- Render new captcha: reset selected grids var, remove from captcha objects arr, reset entire grid styling
  6.2.1.- If the Captcha Objects arr is empty, refill it with a new shuffled version

------------------------------------------------------------------
*/

// (We'll always be using streetViewImages[0] and calling shift() when moving to next Captcha Object)

// ---------------- 1.- Fetch all HTML nodes to conditionally style later on ----------------

// Fetching HTML Nodes   (For conditional styling and rendering)
const checkboxBtn = document.querySelector(".checkbox")
const captchaModal = document.querySelector(".modal-container")
const captchaTitleContainer = document.querySelector(".captcha-title-container")
const captchaTitle = document.querySelector(".captcha-title")
const captchaGrid = document.querySelector(".captcha-grid")
// All grid squares     (Fetched for game logic validation of selected/un-selected squares)
let squares = captchaGrid.children
const verifyBtn = document.querySelector(".verify")
// Footer Icons         (Fetched for injecting click event listeners)
const streetViewBtn = document.querySelector(".la-street-view")
const headphonesBtn = document.querySelector(".la-headphones")
const infoBtn = document.querySelector(".la-info-circle")


// ---------------- 2.- Declare global vars: the shuffled captcha objects & selected grids tracker ----------------

// 1. Copy the current entire array of the data 
let streetViewImages = [...streetImages]
// 2. Shuffle this array for randomized rendering
shuffleArray(streetViewImages)

// For keeping track of user-selected grids of current rendered image       (Constantly emptied and updated)
let selectedGrids = []


// ---------------- 3.- Attach event listeners to square grids, buttons, and icons to enable click functionality ----------------

// 1. "I'm not a robot" component as a button to open the captcha modal
checkboxBtn.addEventListener("click", () => {
  captchaModal.style.display = "block"
  checkboxBtn.classList.toggle("disabled")
})
// 2. Each square grid as a clickable button for selecting/de-selecting
for (let square of squares) {
  square.addEventListener("click", () => {
    handleSquareClick(square) // When clicked: reveals/un-reveals the select-indicator, updates/de-updates grid styling, updates selected grid tracker
  })
}
// 3. Attach event listener to Verify Button    (This btn handles games logic based on currently selected grids and object's correct answer grids)
verifyBtn.addEventListener("click", () => handleActionBtn(verifyBtn))

// 4. Attach event listeners to icons:
// (4.1 - Street View icon : conditionally rendered by 'setStreetViewIcon()' based on current rendered captcha object streetViewURL value (empty or not))

// 4.2 - Spotify Profile Icon
headphonesBtn.addEventListener("click", () => {
  window.open("https://open.spotify.com/user/santiaguirre142?si=2dc888a21f8b4fa2", '_blank');
})
// 4.3 - Info Icon
infoBtn.addEventListener("click", () => {
  window.open("https://santiagdc.framer.website/", '_blank');
})


// ---------------- 4.- Initialize the first captcha grid instance ----------------
// Set Grid BG image 
captchaGrid.style.backgroundImage = `url('${streetViewImages[0].url}')`
// Set Modal Title
captchaTitle.innerText = streetViewImages[0].title
// Enable/Disable street view     (Depends on if the object does have or not a URL to open in Google Street View)
setStreetViewIcon()


// ---------------- 5.- When a square grid is selected: update its styling and the selected grids tracker var ----------------
function handleSquareClick(square) {

  // 1. Update styling: Toggle the selected indicator and the new grid styling (increased border width)
  square.children[0].classList.toggle("hidden")
  square.classList.toggle("selected")
  // 2. Get our current square index to append/remove it from our selectedGrids tracker var
  const squareNodeIndex = Array.prototype.indexOf.call(captchaGrid.children, square) + 1

  // If the user is de-selecting it, remove it from selectedGrids tracker
  if (selectedGrids.includes(squareNodeIndex)) {
    const index = selectedGrids.indexOf(squareNodeIndex)
    selectedGrids.splice(index, 1)
    // If the user is selecting it, append it to selectedGrids tracker
  } else {
    selectedGrids.push(squareNodeIndex)
  }
}

// ---------------- 6.- When the action button is clicked: either run the game logic or render new next captcha object ----------------
function handleActionBtn(btn) {

  // If the button state is "VERIFY" : run the game logic 
  if (btn.innerText === "VERIFY") {

    let finalResult = true
    const correctAnswers = streetViewImages[0].selectionGrids; 

    // ----- 6.1.- Game logic: loop through all squares, check if it's a correct answer or not, display final grid styling based on final answer ------
    let index = 1
    for (const square of squares) {

      const indicator = square.children[0];
      // Fetching the select indicator HTML node (the top-left circle)
      // (Fetching it for conditional styling update based on if that selection was a correct or incorrect answer)

      // If the current square was selected
      if (selectedGrids.includes(index)) {
        
        // If the user did select this square, update selector styling
        if (correctAnswers.includes(index)) {
          indicator.classList.add('correct'); 

        // If the user didn't select this square, update selector styling and update finalResult to false
        // (finalResult remains true if this condition is never met)
        } else {
          finalResult = false
          indicator.classList.add('incorrect');
        }
      index++

      // If the current square wasn't selected and is a missing correct answer, conditionally render the square's styling
      } else {
        if (correctAnswers.includes(index)) {
          finalResult = false
          square.classList.add('missing-selection'); // Red border
        }
        index++
      }

    }


    // Finally, if the final result was that the user selected all correct answers and no incorrect squares:
    if (finalResult) {
      // Captcha modal title bg color
      captchaTitleContainer.style.backgroundColor = "var(--correct-green)"
      // Captcha Footer btn bg color
      verifyBtn.style.backgroundColor = "var(--correct-green)"

    } else {
      // Captcha modal title bg color
      captchaTitleContainer.style.backgroundColor = "var(--wrong-red)"
      // Captcha Footer btn bg color
      verifyBtn.style.backgroundColor = "var(--wrong-red)"
    }
    
    // Change button state 
    btn.innerText = "NEXT IMAGE";

  // If the button state is "NEXT IMAGE" :
  // ------ 6.2.- Render new captcha: reset selected grids var, remove from captcha objects arr, reset entire grid styling ------
  } else if (btn.innerText === "NEXT IMAGE") {

    // Fade out the current captcha before swapping to the next one
    captchaGrid.style.opacity = "0.5"

    setTimeout(() => {
      // 1. Reset selected grids instance to zero
      selectedGrids = []

      // 2. Remove it from copy arr (to avoid it rendering again)
      streetViewImages.shift()

      // ------ 6.2.1.- If the Captcha Objects arr is empty, refill it with a new shuffled version -----
      // 3. IF the user already traversed all Captcha objects and there are none left to render, refill the variable again with a new shuffled version
      if (!streetViewImages[0]) {
        refillStreetViewImages()
      }

      // 4. Reset the entire's grid styling to initial state: remove selected indicators, untoggle selected grids, etc
      resetGridStyling()

      // 5. Update button
      btn.innerText = "VERIFY"

      // Bring the new captcha back to full opacity
      captchaGrid.style.opacity = "1"

    }, 800)
  }
}





// --------------------------------------------------------
// FUNCTION DECLARATION
// --------------------------------------------------------

// When user iterated through all images, start again
function refillStreetViewImages() {
  // Copy again the array of the data 
  streetViewImages = [...streetImages]
  // Shuffle the array again for randomized rendering
  shuffleArray(streetViewImages)
}

// Set current grid back to initial state : no grid selected, default blue on components
function resetGridStyling() {
  // Captcha modal title : bg color back to blue and new title
  captchaTitleContainer.style.backgroundColor = "var(--default-blue)"
  captchaTitle.innerText = streetViewImages[0].title
  // Captcha Grid :  new captcha bg image
  captchaGrid.style.backgroundImage = `url('${streetViewImages[0].url}')`
  // Captcha Footer : btn bg color back to blue
  verifyBtn.style.backgroundColor = "var(--default-blue)"

  // Traverse through each square for styling undoing of selected ones and its top-left select indicators
  let index = 1
  for (let grid of squares) {
    // If current grid was selected, untoggle it & revert indicator color back to default blue
    if (grid.classList.contains("selected")) {
      // Remove incorrect selection indicator styling
      grid.children[0].classList.remove('incorrect');
      grid.children[0].classList.remove('correct');
      // Hide again the selector check indicator
      grid.children[0].classList.toggle("hidden")
      // Remove selected styling
      grid.classList.toggle("selected")
    }

    // Toggle the missing correct grids answers selected back to without red border
    grid.classList.remove("missing-selection")

    // Set street view icon based on object's URL value
    setStreetViewIcon()

    // Move to next grid
    index++
  }
}

function setStreetViewIcon() {
  // If object has no google street view value, disable it
    if (streetViewImages[0].streetViewURL === "") {
      console.log("EMPTY GOOGLE MAPS URL")
      streetViewBtn.classList.add("disabled")
      streetViewBtn.classList.remove("tooltip")
      streetViewBtn.removeEventListener("click", openStreetViewNewTab)
    } else {
      streetViewBtn.classList.remove("disabled")
      streetViewBtn.classList.add("tooltip")
      // Street View Icon
      streetViewBtn.addEventListener("click", openStreetViewNewTab)
    }
}

// HAS to be a separate function so that removeEventListener works correctly
function openStreetViewNewTab() {
  window.open(streetViewImages[0].streetViewURL, '_blank');
}

// Shuffle the current array that holds all captcha objects to render in a new randomized order 
// (Fisher-Yates shuffle Algorithm)
export default function shuffleArray(arr) {

    // 1. We start at the end of the array
    let currentIndex = arr.length;

    // 2. Working backwards (from end to beginning) : Keep looping as long as there are still items to shuffle
    while (currentIndex != 0) {

        // Pick a random element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And then swap it with the current index element.
        [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
    }

    return arr
}
