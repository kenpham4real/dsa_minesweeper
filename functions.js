let columns, rows, mines;
let mineCell = [];
let cellsUnboxed = 0,
  flagged = 0,
  hasGameOver = false,
  hasWon = false,
  newUnboxedCellsStack = [],
  unboxedCellsStack = []; // Clear the unboxed cells stack

// function GenBoard() {
//   cellsUnboxed = 0;
//   flagged = 0;
//   hasGameOver = false;
//   hasWon = false;
//   let rowCount = window.prompt("Enter the number of rows:"); let columnCount =
//   window.prompt("Enter the number of columns:"); let mineCount =
//   window.prompt("Enter the number of mines");
//   // let rowCount = 5;
//   // let columnCount = 5;
//   // let mineCount = 10;
//   setBoard(rowCount, columnCount);
//   setMineCount(mineCount);
// }

/**
 * 
 * @summary đổi từ handleClick --> onPlayerClick
 */
function onPlayerClick(e) {
  if (hasGameOver) return;
  if (e.target.classList.contains("uncovered")) return;
  if (e.button === 0) {
    leftClick(e.target);
    handleUnboxedCellsStack();
  } else if (e.button === 2) {
    e.preventDefault();
    rightClick(e.target);
    handleUnboxedCellsStack();
  }
}

const handleUnboxedCellsStack = () => {
  unboxedCellsStack.push(newUnboxedCellsStack);
  newUnboxedCellsStack = [];
};

function setBoard(rowCount, columnCount) {
  if (rowCount === 1 && columnCount === 1) {
    window.alert("There should be at least 2 rows or 2 columns");
    init();
  } else {
    rows = +rowCount;
    columns = +columnCount;
    let size = 50;
    let render = "";
    let wrapperSize = size * rows;
    let fontSize = (Math.sqrt(5) / Math.sqrt(rows)) * 40;
    //console.log(fontSize);
    document.documentElement.style.setProperty("--tiles", rows);
    document.documentElement.style.setProperty("--size", size + "px");
    document.documentElement.style.setProperty(
      "--wrapperSize",
      wrapperSize + "px"
    );
    document.documentElement.style.setProperty("--fontSize", fontSize + "px");
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        render =
          render +
          `<div class="cell covered" data-index=${i * rows + (j + 1)} ></div>`;
      }
    }
    document.querySelector(".board").innerHTML = render;
  }

  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) =>
    cell.addEventListener("mousedown", (e) => onPlayerClick(e))
  );
}

function setMineCount(mineCount) {
  if (mineCount >= columns * rows - 1) {
    window.alert("Mines must be fewer than cells");
    init();
  } else if (mineCount <= 0) {
    window.alert("There must be at least one mine");
    init();
  } else {
    mines = +mineCount;
    placeMines();
  }
  document.querySelector("#count").innerHTML = mines - flagged;
}
/**
 * @summary đổi từ plantMines --> placeMines
 */
function placeMines() {
  let landMines = [];
  while (landMines.length < mines) {
    let num = Math.floor(Math.random() * rows * columns);
    if (landMines.indexOf(num) === -1) {
      landMines.push(num);
      document
        .querySelector(`.cell[data-index="${num + 1}"]`)
        .classList.add("mine");
    }
  }
  mineCell = landMines;
  updateCellValues();
}
/**
 * @summary đổi từ directionsToCheck --> onCheckingDirections
 */
function onCheckingDirections(cellNumber) {
  const i = cellNumber - 1;
  let result = [1, 1, 1, 1];
  if (i < rows || i < columns) result[0] = 0;
  if (i % rows === 0 || i % columns === 0) result[3] = 0;
  if ((i + 1) % rows === 0 || (i + 1) % columns === 0) result[2] = 0;
  if (i + rows > rows * columns) result[1] = 0;
  return result;
}

function rightClick(cell) {
  if (cell.innerHTML === "" && flagged < mines) {
    cell.innerHTML = "🚩";
    ++flagged;
  } else {
    cell.innerHTML = "";
    --flagged;
  }
  document.querySelector("#count").innerHTML = mines - flagged;
  newUnboxedCellsStack.push(cell);
  won();
}

function updateCellValues() {
  // console.log(mineCell);
  const cells = document.querySelectorAll(".cell");

  cells.forEach((cell) => {
    const i = cell.dataset.index - 1;
    if (mineCell.indexOf(i) !== -1) {
      cell.setAttribute("data-value", -1);
      return;
    }
    let mineCount = 0;
    const directions = onCheckingDirections(i + 1);
    if (directions[0]) {
      //if above needs to be checked
      if (mineCell.indexOf(i - rows) !== -1)
        // check north
        ++mineCount;
      if (directions[2]) {
        //if right
        if (mineCell.indexOf(i - columns + 1) !== -1)
          // check NE
          ++mineCount;
      }
      if (directions[3]) {
        //if left
        if (mineCell.indexOf(i - columns - 1) !== -1)
          //check NW
          ++mineCount;
      }
    }
    if (directions[1]) {
      //if below
      if (mineCell.indexOf(i + rows) !== -1)
        //check south
        ++mineCount;
      if (directions[2]) {
        //if right
        if (mineCell.indexOf(i + columns + 1) !== -1)
          //check SE
          ++mineCount;
      }
      if (directions[3]) {
        //if left
        if (mineCell.indexOf(i + columns - 1) !== -1)
          //check SW
          ++mineCount;
      }
    }
    if (directions[2]) {
      //if right
      if (mineCell.indexOf(i + 1) !== -1)
        //check E
        ++mineCount;
    }
    if (directions[3]) {
      //if left
      if (mineCell.indexOf(i - 1) !== -1)
        //check W
        ++mineCount;
    }
    cell.setAttribute("data-value", mineCount);
  });
  // console.log(onCheckingDirections(1));
}

function leftClick(cell) {
  if (cell.innerHTML === "🚩") return;
  cellsUnboxed++;
  cell.classList.remove("covered");

  if (cellsUnboxed === 1) {
    if (cell.dataset.value === "-1") {
      while (cell.dataset.value === "-1") {
        placeMines();
      }
      updateCellValues();
    }
  }

  if (cell.dataset.value === "-1") {
    // console.log('mine');
    cell.classList.add("uncovered");
    cell.innerHTML = "💣";
    reveal();
    setTimeout(() => {
      window.alert("You clicked on a mine. You lost!");
    }, 1500);
  } else {
    newUnboxedCellsStack.push(cell); // Store the unboxed cell in the stack
    if (cell.dataset.value === "0") {
      const i = +cell.dataset.index;
      cell.classList.add("uncovered");
      const directions = onCheckingDirections(i);
      const regions = [];
      if (directions[0]) {
        //if above needs to be checked
        regions.push(i - rows);
        if (directions[2]) {
          //if right
          regions.push(i - rows + 1);
        }
        if (directions[3]) {
          //if left
          regions.push(i - rows - 1);
        }
      }
      if (directions[1]) {
        //if below
        regions.push(i + rows);
        if (directions[2]) {
          //if right
          regions.push(i + rows + 1);
        }
        if (directions[3]) {
          //if left
          regions.push(i + rows - 1);
        }
      }
      if (directions[2]) {
        //if right
        regions.push(i + 1);
      }
      if (directions[3]) {
        //if left
        regions.push(i - 1);
      }

      regions.forEach((region) => {
        const cellToUncover = document.querySelector(
          `.covered[data-index="${region}"]`
        );
        if (cellToUncover != null) leftClick(cellToUncover);
      });
    } else {
      cell.classList.add("uncovered");
      cell.innerHTML = cell.dataset.value;
    }
  }
  won();
}

/**
 * @author Ken Pham
 * @user_story https://trello.com/c/9LAOaBas
 */
const won = () => {
  console.log("cellsUnboxed", cellsUnboxed);
  console.log("flagged", flagged);
  console.log("rows", rows);
  console.log("columns", columns);
  if (cellsUnboxed + flagged === rows * columns || mines === 0) {
    window.alert("You Won");
    hasWon = true;
    reveal();
    return;
  }
};
/**
 * @author Ken Pham
 */
const reveal = () => {
  const cellsToReveal = document.querySelectorAll(".mine");
  cellsToReveal.forEach((cell) => {
    cell.classList.remove("covered");
    cell.classList.add("uncovered");
    if (cell.dataset.value === "-1") {
      cell.innerHTML = "💣";
      if (!hasWon)
        setTimeout(() => {
          cell.innerHTML = "💥";
        }, 1000);
    } else cell.innerHTML = cell.dataset.value;
  });
  hasGameOver = true;
  return;
};
/**
 * @author Ken Pham
 * @user_story https://trello.com/c/uwE2Ec6R
 */
const undoClick = () => {
  let lastClickedCell = unboxedCellsStack.pop();
  console.log("lastClickedCell", lastClickedCell);
  for (let i in lastClickedCell) {
    if (lastClickedCell[i].classList.contains("uncovered")) {
      lastClickedCell[i].classList.remove("uncovered");
      lastClickedCell[i].classList.add("covered");
      lastClickedCell[i].innerHTML = "";
      cellsUnboxed--;
    } else {
      lastClickedCell[i].classList.remove("uncovered");
      lastClickedCell[i].classList.add("covered");
      lastClickedCell[i].innerHTML = "";
      cellsUnboxed--;
    }
  }
  flagged = 0; // Reset the flagged count
  won(); // Check for win condition
};

// Add an event listener to the undo button
const undoButton = document.querySelector("#undoButton");
if (undoButton) {
  undoButton.addEventListener("click", undoClick);
}
