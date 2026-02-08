let boards;
const boardsModule = await import('./boards.js');
boards = boardsModule.default;

class BreadthFirstSearchAlgorithmDemo {
  #ghost;
  #destinationCell = null;
  #movementInterval = null;
  #cellProps = boards['12x12'];
  #board = document.getElementById('board');
  
  constructor() {
    const loadGhost = () => {
      const ghost = document.createElement('img');
      ghost.src = './ghost.png';
      ghost.alt = 'ghost';
      ghost.id = 'ghost';
      
      this.#ghost = ghost;
    }
    
    loadGhost();
  }
  
  #getValidAdjacentCells(refCell, getWeightedAdj = false) {
    const refId = Number.parseInt(refCell.id.split('-').at(1));
    
    const getNextById = (id) => document.querySelector(`#cell-${id}.cell--enabled`);
    
    const adjacent = [
      { name: 'left', cell: getNextById(refId - 1) },
      { name: 'top', cell: getNextById(refId - this.#cellProps.length) },
      { name: 'bottom', cell: getNextById(refId + this.#cellProps.length) },
      { name: 'right', cell: getNextById(refId + 1) },
    ];
    
    const validSqrs = adjacent.filter(({ cell }) => {
      if (getWeightedAdj) {
        return cell !== null && cell?.dataset?.weight !== null
      } else {
        return cell !== null && cell?.dataset?.weight === 'null'
      }
    });
    
    return validSqrs;
  }
  
  #propagateWeight(refCell) {
    const queue = [{ cell: refCell, distance: 0 }];

    while (queue.length > 0) {
      const { cell, distance } = queue.shift();
      
      const adjacentCells = this.#getValidAdjacentCells(cell);
      
      adjacentCells.forEach(({ cell }) => {
        cell.dataset.weight = distance + 1;
        
        queue.push({ cell, distance: distance + 1 });
      });
    }
  }
  
  #clearBoard() {
    const cells = document.querySelectorAll('.cell--enabled');
    cells.forEach((el) => {
      el.dataset.weight = null;
    });
  }
  
  #moveGhost() {
    const halfSecond = 500;
    
    if (this.#movementInterval) {
      clearInterval(this.#movementInterval);
    }
    
    this.#movementInterval = setInterval(() => {
      const adjacent = this.#getValidAdjacentCells(this.#ghost.parentElement, true);
      
      const currentPos = this.#ghost.parentElement;
      
      adjacent.forEach(({ cell }) => {
        if (Number.parseInt(cell.dataset.weight) < Number.parseInt(currentPos.dataset.weight)) {
          cell.appendChild(this.#ghost);
        }
      });
      
      if (this.#ghost.parentElement === this.#destinationCell) {
        clearInterval(this.#movementInterval);
        this.#movementInterval = null;
      }
    }, halfSecond);
  }
  
  #markDestination(event) {
    const prevDestinationCell = this.#destinationCell;
    if (prevDestinationCell) {
      prevDestinationCell.classList.remove('cell--selected');
      prevDestinationCell.dataset.weight = null;
    }
    
    this.#clearBoard();
    const cell = event.currentTarget;
    cell.classList.add('cell--selected');
    this.#destinationCell = cell;
    cell.dataset.weight = 0;
    
    this.#propagateWeight(cell);
    this.#moveGhost();
  }
  
  #createBoard(size = 'board--12x12') {
    this.#board.classList.add(size);

    this.#cellProps.forEach((column) => {
      column.forEach(({ enabled, index }) => {
        const cell = document.createElement('div');
        cell.classList.add('cell', 'cell--with-border');
        cell.id = `cell-${index}`;
        
        if (enabled) {
          cell.dataset.weight = '';
          cell.classList.add('cell--enabled', 'cell--show-weight');
          cell.addEventListener('click', this.#markDestination.bind(this));
        }
        
        this.#board.appendChild(cell);
      });
    });
  }
  
  #setOptions() {
    const showHideProps = (checkbox, className) => {
      this.#board.childNodes.forEach((cell) => {
        if (checkbox.checked) {
          cell.classList.add(className);
        } else {
          cell.classList.remove(className);
        }
      });
    }

    const showBorders = document.getElementById('show-borders');
    showBorders.addEventListener('change', () => showHideProps(showBorders, 'cell--with-border'));
    
    const showWeights = document.getElementById('show-weight');
    showWeights.addEventListener('change', () => showHideProps(showWeights, 'cell--show-weight'));
  }

  start() {
    this.#createBoard();
    this.#setOptions();
    
    const initialGhostPos = document.getElementById(`cell-${18}`);
    initialGhostPos.appendChild(this.#ghost);
  }
}

const demo = new BreadthFirstSearchAlgorithmDemo();
demo.start();
