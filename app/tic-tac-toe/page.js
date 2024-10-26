'use client';
import { useState } from 'react';
import { X, Circle } from 'lucide-react';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(0));
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [gameMode, setGameMode] = useState(null);
  const [gameStatus, setGameStatus] = useState('select');
  const [winner, setWinner] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [playerNumber, setPlayerNumber] = useState(1);

  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const checkWinner = (boardState) => {
    for (let combo of winningCombos) {
      const [a, b, c] = combo;
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        return boardState[a];
      }
    }
    if (!boardState.includes(0)) return 'draw';
    return null;
  };

  const getAIMove = async (boardState) => {
    try {
      // Convert board state for API
      const apiBoard = playerNumber === 2 
        ? boardState.map(cell => cell === 1 ? 2 : (cell === 2 ? 1 : 0))
        : [...boardState];

      const response = await fetch('https://modelhost-production.up.railway.app/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: apiBoard
        })
      });
      const data = await response.json();
      return data.predicted_move;
    } catch (error) {
      console.error('Error getting AI move:', error);
      return null;
    }
  };

  const makeAIMove = async (boardState) => {
    setIsThinking(true);
    const aiMove = await getAIMove(boardState);
    setIsThinking(false);

    if (aiMove !== null) {
      const aiBoard = [...boardState];
      const aiPlayerNumber = playerNumber === 1 ? 2 : 1;
      aiBoard[aiMove] = aiPlayerNumber;
      setBoard(aiBoard);
      
      const aiResult = checkWinner(aiBoard);
      if (aiResult) {
        setGameStatus(aiResult === 'draw' ? 'draw' : 'won');
        setWinner(aiResult);
      } else {
        setCurrentPlayer(playerNumber);
      }
    }
  };

  const handleClick = async (index) => {
    // Return if: cell is occupied, game is over, or it's AI's turn
    if (board[index] !== 0 || 
        gameStatus === 'won' || 
        gameStatus === 'draw' || 
        isThinking ||
        (gameMode === 'ai' && currentPlayer !== playerNumber)) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = playerNumber;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setGameStatus(result === 'draw' ? 'draw' : 'won');
      setWinner(result);
      return;
    }

    if (gameMode === 'ai') {
      setCurrentPlayer(playerNumber === 1 ? 2 : 1);
      await makeAIMove(newBoard);
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  };

  const startGame = async (mode, movePosition) => {
    const newBoard = Array(9).fill(0);
    setBoard(newBoard);
    setGameMode(mode);
    setGameStatus('playing');
    setPlayerNumber(movePosition);
    setCurrentPlayer(1);
    setWinner(null);
    setIsThinking(false);

    // If player chose to go second (O), AI makes first move
    if (mode === 'ai' && movePosition === 2) {
      await makeAIMove(newBoard);
    }
  };

  const resetGame = () => {
    const newBoard = Array(9).fill(0);
    setBoard(newBoard);
    setCurrentPlayer(1);
    setGameStatus('playing');
    setWinner(null);
    setIsThinking(false);
    
    // If player is second, AI makes first move
    if (gameMode === 'ai' && playerNumber === 2) {
      makeAIMove(newBoard);
    }
  };

  const renderCell = (value, index) => {
    const isDisabled = 
      board[index] !== 0 || 
      gameStatus === 'won' || 
      gameStatus === 'draw' || 
      isThinking ||
      (gameMode === 'ai' && currentPlayer !== playerNumber);

    return (
      <button
        key={index}
        onClick={() => handleClick(index)}
        className={`w-full h-full flex items-center justify-center bg-white 
          ${!isDisabled ? 'hover:bg-gray-100' : 'cursor-not-allowed'} 
          border border-gray-200 rounded-lg transition-colors`}
        disabled={isDisabled}
      >
        {value === 1 && <X className="w-12 h-12 text-blue-500" />}
        {value === 2 && <Circle className="w-12 h-12 text-red-500" />}
      </button>
    );
  };

  if (gameStatus === 'select') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8 text-gray-800">Tic Tac Toe</h1>
          <div className="space-y-4">
            <button
              onClick={() => startGame('friend', 1)}
              className="w-64 p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Play with Friend
            </button>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-700">Play with AI</h2>
              <button
                onClick={() => startGame('ai', 1)}
                className="w-64 p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Play First (X)
              </button>
              <button
                onClick={() => startGame('ai', 2)}
                className="w-64 p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Play Second (O)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold mb-4 text-center text-gray-800">
          Tic Tac Toe
        </h1>
        <div className="mb-4 text-center">
          {gameStatus === 'playing' && !isThinking && (
            <p className="text-xl text-gray-600">
              {gameMode === 'ai' 
                ? (currentPlayer === playerNumber ? "Your turn" : "AI's turn")
                : `Player ${currentPlayer}'s turn`}
            </p>
          )}
          {isThinking && <p className="text-xl text-gray-600">AI is thinking...</p>}
          {gameStatus === 'won' && (
            <p className="text-xl text-green-600">
              {gameMode === 'ai'
                ? (winner === playerNumber ? 'You win!' : 'AI wins!')
                : `Player ${winner} wins!`}
            </p>
          )}
          {gameStatus === 'draw' && (
            <p className="text-xl text-yellow-600">It's a draw!</p>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4 aspect-square mb-4">
          {board.map((value, index) => renderCell(value, index))}
        </div>
        <div className="text-center">
          <button
            onClick={resetGame}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Reset Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;