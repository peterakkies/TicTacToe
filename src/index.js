import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

/*
  We could have made Square an extension of React.Component,
  but we add it as a function instead, because it is simpler
  to write a function and because a function executes faster.
*/
function Square(props) {
  return (
    /*
      We call props.onClick rather than props.onClick()
      because the latter would call onClick immediately.
    */
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {

  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  renderRow(i) {
    var rowHTML = [];

    for (let j = 0; j < 3; j++) {
      rowHTML.push(this.renderSquare(i * 3 + j));
    }

    return (
      <div className="board-row">{rowHTML}</div>
    );
  }

  render() {
    var boardHTML = [];

    for (let i = 0; i < 3; i++) {
      boardHTML.push(this.renderRow(i));
    }

    return <div>{boardHTML}</div>;
  }
}

class Game extends React.Component {

  /* Pull up state from Board into Game. */
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        i: -1,
      }],
      stepNumber: 0,
      xIsNext: true,
    }
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = determineWinner(current.squares);

    /* Create a button for each move made that takes us back to that move. */
    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move + ' (' + getCol(this.state.history[move].i) + ', ' + getRow(this.state.history[move].i) + ')' :
        'Go to game start';

      /* Bold the currently selected step. */
      if(this.state.stepNumber === move)
      {
        return (
          <li key={move}>
            <button style={{fontWeight: 'bold'}} onClick={() => this.jumpTo(move)}>{desc}</button>
          </li>
        )
      } else {
        return (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}>{desc}</button>
          </li>
        )
      }

    });

    let status;
    if(winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
        <Board
          squares = {current.squares}
          onClick = {(i) => this.handleClick(i)}
        />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }

  /* This method adds an X to a square when the user clicks on the square. */
  handleClick(i) {

    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    /*
      If there is already a winner, or the square has already been filled,
      do not change the square.
    */
    if(determineWinner(squares) || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O';

    this.setState({
      history: history.concat([{
        squares: squares,
        /* Record which square was clicked. */
        i: i,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }
}

/*
  Determines the winner of the game by checking whether any column or row
  includes three Xs or three Os.
*/
function determineWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

/* Returns the column number of a given square. */
function getCol(i) {
  return i % 3 + 1;
}

/* Returns the row number of a given square. */
function getRow(i) {
  return Math.ceil((i+1)/3);
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
