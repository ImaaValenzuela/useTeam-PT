import React from 'react';
import Column from './Column';
import { useKanban } from '../../hooks/useKanban';
import './Board.css';

const COLUMNS = [
  { id: 'backlog', title: '📋 Backlog' },
  { id: 'todo', title: '📝 To Do' },
  { id: 'in-progress', title: '⚡ In Progress' },
  { id: 'review', title: '👀 Review' },
  { id: 'done', title: '✅ Done' },
];

const Board = () => {
  const {
    cards,
    loading,
    createCard,
    moveCard,
    updateCard,
    deleteCard,
  } = useKanban();

  const handleCardMove = async (cardId, destinationColumnId, destinationIndex) => {
    try {
      await moveCard(cardId, destinationColumnId, destinationIndex);
    } catch (error) {
      console.error('Error al mover tarjeta:', error);
    }
  };

  const getCardsByColumn = (columnId) =>
    cards.filter((c) => c.column === columnId).sort((a, b) => a.position - b.position);

  if (loading) {
    return (
      <div className="board-loading">
        <div className="spinner"></div>
        <p>Cargando tablero...</p>
      </div>
    );
  }

  return (
    <div className="board">
      {COLUMNS.map((column) => (
        <Column
          key={column.id}
          column={column}
          cards={getCardsByColumn(column.id)}
          onCreateCard={createCard}
          onUpdateCard={updateCard}
          onDeleteCard={deleteCard}
          onCardMove={handleCardMove}
        />
      ))}
    </div>
  );
};

export default Board;
