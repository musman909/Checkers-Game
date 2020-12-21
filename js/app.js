const blocks = Array.from(document.querySelectorAll(".block.dark"));
// board array
const board = new Array(8),
  black = "black",
  red = "red",
  dark = "dark",
  killMove = "kill",
  simpleMove = "simple";

let turn = black,
  selectedX = null,
  selectedY = null,
  graph = [],
  moveableBlocks = [];


init();
selectMoveableBlocks();

function init() {
  for (let i = 0; i < board.length; i++) board[i] = new Array(8);

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      const current = i.toString() + j.toString();
      const currentBlock = document.getElementById("b" + current);
      if (current <= "27" && currentBlock.classList.contains(dark)) {
        board[i][j] = "b";
        currentBlock.classList.add(black);
      } else if (current >= "50" && currentBlock.classList.contains(dark)) {
        board[i][j] = "r";
        currentBlock.classList.add(red);
      } else
        board[i][j] = 0;
    }
  }
  blocks.forEach(function (block) {
    if (block.classList.contains(black) || block.classList.contains(red))
      block.append(document.createElement("span"));
  });
}


function selectMoveableBlocks() {
  let currentPlayerBlocks = [];
  moveableBlocks = [];
  const opponent = (turn === black) ? "r" : "b";

  blocks.forEach(function (block) {
    if (block.classList.contains(turn))
      currentPlayerBlocks.push(block);
  });

  currentPlayerBlocks.forEach(function (block) {
    const cordsObj = getCordsFromID(block.id);
    initGraph(cordsObj.X, cordsObj.Y, opponent);
    if (graph.length > 0)
      moveableBlocks.push({ block, graph, type: killMove });
  });

  if (moveableBlocks.length <= 0)
    currentPlayerBlocks.forEach(function (block) {
      graph = [];
      setPositions(block);
      if (graph.length > 0)
        moveableBlocks.push({ block, graph, type: simpleMove });
    });

  if (moveableBlocks.length <= 0)
    alert("Game Over!");
  else
    moveableBlocks.forEach(function (blockObj) {
      blockObj.block.onclick = function () { move(blockObj) }
      // currentBlock.firstElementChild.style.boxShadow = "0 0 10px #fff";
      blockObj.block.style.background = "#00008b";
    });
  graph = [];
}

function initGraph(X, Y, opponent) {
  graph = [];
  const block = getBlockFromCords(X, Y);
  if (block.firstElementChild.classList.contains("king"))
    kingTraverse(X, Y, opponent, null);
  else if (turn === black)
    blackTraverse(X, Y, opponent, null);
  else if (turn === red)
    redTraverse(X, Y, opponent, null);
}

function move(blockObj) {
  // console.log(block.getBoundingClientRect());
  if (blockObj.graph.length <= 1) {
    changeTurn();
    selectMoveableBlocks();
  } else {
    const currentBlock = blockObj.block;
    const cordsObj = getCordsFromID(currentBlock.id);
    setBackground("#ba7a3a");
    if (selectedX !== null && selectedY !== null)
      removeChildClass("b" + selectedY + selectedX, "selected");
    if (currentBlock.classList.contains(turn)) {
      currentBlock.firstElementChild.classList.add("selected");
      selectedX = cordsObj.X;
      selectedY = cordsObj.Y;
      graph = blockObj.graph;
      setBackground("#00bb00");
      // currentBlock.style.background = "#00008b";
      graph.forEach(function (obj) {
        if (obj.currentBlock !== currentBlock)
          obj.currentBlock.onclick = function () { jump(this, blockObj.type) };
      });
    }
  }
}

function jump(dBlock, moveType) {
  if (selectedX !== null && selectedY !== null && foundInGraph(dBlock)) {
    const sBlock = getBlockFromCords(selectedX, selectedY);
    const cordsObj = getCordsFromID(dBlock.id);
    const bestPath = getBestPath(sBlock, dBlock);
    movePiece(bestPath);

    removeClass(sBlock.id, turn);
    removeChildClass(dBlock.id, "selected");
    addClass(dBlock.id, turn);
    setBackground("#ba7a3a");

    board[selectedY][selectedX] = 0;
    board[cordsObj.Y][cordsObj.X] = turn.substring(0, 1);
    selectedX = selectedY = null;
    removeClickEvent();
    const becomesKing = checkForKing(dBlock);
    if (moveType === simpleMove || becomesKing || graph.length < 2) {
      changeTurn();
      selectMoveableBlocks();
    } else if (moveType === killMove) {
      const opponent = (turn === black) ? "r" : "b";
      initGraph(cordsObj.X, cordsObj.Y, opponent);
      move({ block: dBlock, graph: graph, type: killMove });
    }
  }
}

function removeClickEvent() {
  for (let i = 0; i < graph.length; i++)
    graph[i].currentBlock.onclick = null;
  for (let i = 0; i < moveableBlocks.length; i++) {
    moveableBlocks[i].block.onclick = null;
    moveableBlocks[i].block.style.background = "#ba7a3a";
  }
}

function foundInGraph(block) {
  for (let i = 0; i < graph.length; i++)
    if (block === graph[i].currentBlock)
      return true;
  return false;
}

function changeTurn() {
  turn = (turn === black) ? red : black;
}

function movePiece(pathArray) {
  for (let i = 0; i < pathArray.length - 1; i++) {
    const currentBlock = pathArray[i];
    const nextBlock = pathArray[i + 1];
    let opponentBlock = null;

    const pID = parseInt(currentBlock.id.substring(1));
    const cID = parseInt(nextBlock.id.substring(1));

    const piece = currentBlock.firstElementChild;
    currentBlock.removeChild(piece);
    nextBlock.appendChild(piece);

    if (pID > cID) {
      if (pID === cID + 22) {
        // upper left
        opponentBlock = getBlockFromID("b" + (pID - 11));
      } else if (pID === cID + 18) {
        // upper right 
        opponentBlock = getBlockFromID("b" + (pID - 9));
      }
    }
    else {
      if (pID + 22 === cID) {
        // lower right
        opponentBlock = getBlockFromID("b" + (pID + 11));
      } else if (pID + 18 === cID) {
        // lower left
        opponentBlock = getBlockFromID("b" + (pID + 9));
      }
    }
    if (opponentBlock) {
      const cordsObj = getCordsFromID(opponentBlock.id);
      opponentBlock.removeChild(opponentBlock.firstElementChild);
      opponentBlock.className = "block dark";
      board[cordsObj.Y][cordsObj.X] = 0;
    }
  }
}


function setPositions(block) {
  const cordsObj = getCordsFromID(block.id);
  const cX = cordsObj.X;
  const cY = cordsObj.Y;
  const isKing = block.firstElementChild.classList.contains("king");
  const currentID = "b" + cY + cX;
  graph = [];

  if (block.classList.contains(black) || isKing) {
    if (cY < 7) {
      if (cX === 0) { // if in left corner
        if (board[cY + 1][cX + 1] === 0) // if right position is empty
          addInGraph(cX + 1, cY + 1, currentID);
      }
      else if (cX === 7) { // if in right corner
        if (board[cY + 1][cX - 1] === 0) // if left position is empty
          addInGraph(cX - 1, cY + 1, currentID);
      }
      else if (board[cY + 1][cX + 1] === 0 && board[cY + 1][cX - 1] === 0) // if both left & right is empty
        addInGraph(cX + 1, cY + 1, currentID), addInGraph(cX - 1, cY + 1, currentID);
      else if (board[cY + 1][cX + 1] !== 0 && board[cY + 1][cX - 1] === 0) // if left is empty & right is not empty
        addInGraph(cX - 1, cY + 1, currentID);
      else if (board[cY + 1][cX + 1] === 0 && board[cY + 1][cX - 1] !== 0) // if left is not empty & right is empty
        addInGraph(cX + 1, cY + 1, currentID);
    }
  }
  if (block.classList.contains(red) || isKing) {
    if (cY > 0) {
      if (cX === 0) { // if in left corner
        if (board[cY - 1][cX + 1] === 0) // if right position is empty
          addInGraph(cX + 1, cY - 1, currentID);
      } else if (cX === 7) { // if in right corner
        if (board[cY - 1][cX - 1] === 0) // if left position is empty
          addInGraph(cX - 1, cY - 1, currentID);
      }
      else if (board[cY - 1][cX + 1] === 0 && board[cY - 1][cX - 1] === 0) // if both left & right = empty
        addInGraph(cX + 1, cY - 1, currentID), addInGraph(cX - 1, cY - 1, currentID);
      else if (board[cY - 1][cX + 1] !== 0 && board[cY - 1][cX - 1] === 0) // if left is empty & right is not empty
        addInGraph(cX - 1, cY - 1, currentID);
      else if (board[cY - 1][cX + 1] === 0 && board[cY - 1][cX - 1] !== 0) // if left is not empty & right is empty
        addInGraph(cX + 1, cY - 1, currentID);
    }
  }
}

function blackTraverse(x, y, opponent, parent) {
  const currentID = "b" + y + x;
  const current = getBlockFromID(currentID);

  if (x >= 2 && y <= 5 && board[y + 1][x - 1] === opponent && board[y + 2][x - 2] === 0 && current !== parent) {
    addInGraph(x - 2, y + 2, currentID);
    blackTraverse(x - 2, y + 2, opponent, current);
  }
  if (x <= 5 && y <= 5 && board[y + 1][x + 1] === opponent && board[y + 2][x + 2] === 0 && current !== parent) {
    addInGraph(x + 2, y + 2, currentID);
    blackTraverse(x + 2, y + 2, opponent, current);
  }
}


function redTraverse(x, y, opponent, parent) {
  const currentID = "b" + y + x;
  const current = getBlockFromID(currentID);

  if (x >= 2 && y >= 2 && board[y - 1][x - 1] === opponent && board[y - 2][x - 2] === 0 && current != parent) {
    addInGraph(x - 2, y - 2, currentID);
    redTraverse(x - 2, y - 2, opponent, current);
  }
  if (x <= 5 && y >= 2 && board[y - 1][x + 1] === opponent && board[y - 2][x + 2] === 0 && current != parent) {
    addInGraph(x + 2, y - 2, currentID);
    redTraverse(x + 2, y - 2, opponent, current);
  }
}

function kingTraverse(x, y, opponent, parent) {
  const currentID = "b" + y + x;
  const current = getBlockFromID(currentID);

  // bottom left check
  if (x >= 2 && y <= 5 && board[y + 1][x - 1] === opponent && board[y + 2][x - 2] === 0) {

    if (getBlockFromID("b" + (y + 2) + (x - 2)) !== parent && !isDuplicate(x - 2, y + 2, currentID)) {
      addInGraph(x - 2, y + 2, currentID);
      kingTraverse(x - 2, y + 2, opponent, current);
    }
  }
  // bottom right check
  if (x <= 5 && y <= 5 && board[y + 1][x + 1] === opponent && board[y + 2][x + 2] === 0) {
    if (getBlockFromID("b" + (y + 2) + (x + 2)) !== parent && !isDuplicate(x + 2, y + 2, currentID)) {
      addInGraph(x + 2, y + 2, currentID);
      kingTraverse(x + 2, y + 2, opponent, current);
    }
  }
  // upper left check
  if (x >= 2 && y >= 2 && board[y - 1][x - 1] === opponent && board[y - 2][x - 2] === 0) {
    if (getBlockFromID("b" + (y - 2) + (x - 2)) !== parent && !isDuplicate(x - 2, y - 2, currentID)) {
      addInGraph(x - 2, y - 2, currentID);
      kingTraverse(x - 2, y - 2, opponent, current);
    }
  }
  // upper right check
  if (x <= 5 && y >= 2 && board[y - 1][x + 1] === opponent && board[y - 2][x + 2] === 0) {
    if (getBlockFromID("b" + (y - 2) + (x + 2)) !== parent && !isDuplicate(x + 2, y - 2, currentID)) {
      addInGraph(x + 2, y - 2, currentID);
      kingTraverse(x + 2, y - 2, opponent, current);
    }
  }
}

function isDuplicate(X, Y, parentID) {
  const childBlock = getBlockFromCords(X, Y);
  const parentBlock = getBlockFromID(parentID);
  for (let i = 0; i < graph.length; i++)
    if (graph[i].currentBlock === parentBlock && graph[i].nextBlocks.includes(childBlock))
      return true;
  return false;
}

function addInGraph(X, Y, parentID) {
  const childBlock = getBlockFromCords(X, Y);
  const parentBlock = getBlockFromID(parentID);
  let pFound = false;
  let cFound = false;

  for (let i = 0; i < graph.length; i++) {
    if (graph[i].currentBlock === parentBlock) {
      graph[i].nextBlocks.push(childBlock);
      pFound = true;
    }
    if (graph[i].currentBlock === childBlock)
      cFound = true;
  }
  if (!pFound)
    graph.push({ currentBlock: parentBlock, nextBlocks: [childBlock] });
  if (!cFound)
    graph.push({ currentBlock: childBlock, nextBlocks: [] });
}

function checkForKing(block) {
  const column = parseInt(block.id.substring(1, 2));
  if (block.firstElementChild.classList.contains("king")) return false;
  if ((block.classList.contains(black) && column === 7) || (block.classList.contains(red) && column === 0)) {
    block.firstElementChild.classList.add("king");
    block.firstElementChild.textContent = "K";
    return true;
  }
  return false;
}

//******************************Utility Classes***************************/

function addClass(id, className) {
  const element = document.getElementById(id);
  element.classList.add(className);
}
function removeClass(id, className) {
  const element = document.getElementById(id);
  element.classList.remove(className);
}

function removeChildClass(id, className) {
  const element = document.getElementById(id);
  element.firstElementChild.classList.remove(className);
}
function addChildClass(id, className) {
  const element = document.getElementById(id);
  element.firstElementChild.classList.add(className);
}

function getBlockFromCords(X, Y) {
  return document.getElementById("b" + Y + X);
}
function getBlockFromID(id) {
  return document.getElementById(id);
}

function getCordsFromID(id) {
  const X = parseInt(id.substring(2));
  const Y = parseInt(id.substring(1, 2));
  return { X, Y };
}

function setBackground(color) {
  graph.forEach(function (blockObj) {
    blockObj.nextBlocks.forEach(function (block) {
      block.style.background = color;
    });
  });
}


//****************** Find Best Path *********************//


function getBestPath(sBlock, dBlock) {
  const pathsArray = [];
  const path = [];
  const visited = [];
  const tmpBlock = document.createElement("div");
  tmpBlock.id = "tmp";
  // get All Possible Paths
  setAllPaths(sBlock, dBlock, tmpBlock, visited, path, pathsArray);

  // return Best Path
  if (pathsArray.length > 0) {
    let bestPath = pathsArray[0];
    pathsArray.forEach(function (currentPath) {
      if (currentPath.length > bestPath.length)
        bestPath = currentPath;
    });
    return bestPath;
  }
  // return empty if no path found
  return [];
}

function setAllPaths(currentBlock, dBlock, pBlock, visited, path, pathsArray) {
  const edge = pBlock.id + "to" + currentBlock.id;
  visited.push(edge);
  path.push(currentBlock);
  if (currentBlock === dBlock) {
    pathsArray.push([...path]);
  } else {
    const nextBlocks = getNextBlocks(currentBlock);
    for (let i = 0; i < nextBlocks.length; i++) {
      const currentEdge = currentBlock.id + "to" + nextBlocks[i].id;
      if (nextBlocks[i] !== pBlock && nextBlocks[i] !== currentBlock && visited.indexOf(currentEdge) < 0)
        setAllPaths(nextBlocks[i], dBlock, currentBlock, visited, path, pathsArray);
    }
  }
  path.pop();
  visited.splice(visited.indexOf(edge), 1);
}

function getNextBlocks(currentBlock) {
  for (let i = 0; i < graph.length; i++)
    if (graph[i].currentBlock === currentBlock)
      return graph[i].nextBlocks;
  return [];
}