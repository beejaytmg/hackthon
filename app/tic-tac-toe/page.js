'use client';
import { useState } from 'react';
import { X, Circle } from 'lucide-react';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(0));
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [gameMode, setGameMode] = useState(null); // null, 'ai', or 'friend'
  const [gameStatus, setGameStatus] = useState('select'); // select, playing, won, draw
  const [winner, setWinner] = useState(null);
  const [isThinking, setIsThinking] = useState(false); // New state for AI thinking

  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
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
      const response = await fetch('https://modelhost-production.up.railway.app/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: boardState
        })
      });
      const data = await response.json();
      return data.predicted_move;
    } catch (error) {
      console.error('Error getting AI move:', error);
      return null;
    }
  };

  const handleClick = async (index) => {
    if (isThinking || board[index] !== 0 || gameStatus === 'won' || gameStatus === 'draw') return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setGameStatus(result === 'draw' ? 'draw' : 'won');
      setWinner(result);
      return;
    }

    if (gameMode === 'ai' && currentPlayer === 1) {
      setIsThinking(true); // Set thinking state to true
      const aiMove = await getAIMove(newBoard);
      setIsThinking(false); // Reset thinking state after getting the move

      if (aiMove !== null) {
        setTimeout(() => {
          const aiBoard = [...newBoard];
          aiBoard[aiMove] = 2;
          setBoard(aiBoard);
          const aiResult = checkWinner(aiBoard);
          if (aiResult) {
            setGameStatus(aiResult === 'draw' ? 'draw' : 'won');
            setWinner(aiResult);
          }
        }, 500);
      }
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(0));
    setCurrentPlayer(1);
    setGameStatus('playing');
    setWinner(null);
    setIsThinking(false); // Reset thinking state on game reset
  };

  const renderCell = (value, index) => {
    return (
      <button
        key={index}
        onClick={() => handleClick(index)}
        className="w-full h-full flex items-center justify-center bg-white hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
        disabled={isThinking || value !== 0 || gameStatus === 'won' || gameStatus === 'draw'} // Disable button if AI is thinking or game is over
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
              onClick={() => {
                setGameMode('friend');
                setGameStatus('playing');
              }}
              className="w-64 p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Play with Friend
            </button>
            <button
              onClick={() => {
                setGameMode('ai');
                setGameStatus('playing');
              }}
              className="w-64 p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Play with AI
            </button>
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
          {gameStatus === 'playing' && (
            <p className="text-xl text-gray-600">
              {gameMode === 'ai' && currentPlayer === 2 
                ? "AI's turn" 
                : `Player ${currentPlayer}'s turn`}
            </p>
          )}
          {isThinking && <p className="text-xl text-gray-600">AI is thinking...</p>} {/* Display thinking message */}
          {gameStatus === 'won' && (
            <p className="text-xl text-green-600">
              {winner === 2 && gameMode === 'ai' 
                ? 'AI wins!' 
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
