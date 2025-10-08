import React, { useEffect, useRef, useState } from 'react';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Plus } from 'lucide-react';
import Card from './Card';
import './Column.css';

const Column = ({ column, cards, onCreateCard, onUpdateCard, onDeleteCard, onCardMove }) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  const columnRef = useRef(null);

  // Registrar la columna como drop target
  useEffect(() => {
    const el = columnRef.current;
    if (!el) return;

    const cleanup = dropTargetForElements({
      element: el,
      getData: () => ({ columnId: column.id }),
      onDrop({ source }) {
        const cardId = source.element.dataset.cardId;
        if (cardId) {
          onCardMove(cardId, column.id, 0);
        }
      },
    });

    return cleanup;
  }, [column.id, onCardMove]);

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onCreateCard({
        title: newCardTitle,
        description: newCardDescription,
        column: column.id,
      });
      setNewCardTitle('');
      setNewCardDescription('');
      setIsAddingCard(false);
    }
  };

  return (
    <div className="column" ref={columnRef}>
      <div className="column-header">
        <h3>{column.title}</h3>
        <span className="column-count">{cards.length}</span>
      </div>

      <div className="column-content">
        {cards.map((card, index) => (
          <Card
            key={card._id}
            card={card}
            index={index}
            onUpdate={onUpdateCard}
            onDelete={onDeleteCard}
          />
        ))}
      </div>

      <div className="column-footer">
        {isAddingCard ? (
          <div className="add-card-form">
            <input
              type="text"
              placeholder="Título"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              className="add-card-input"
              autoFocus
            />
            <textarea
              placeholder="Descripción (opcional)"
              value={newCardDescription}
              onChange={(e) => setNewCardDescription(e.target.value)}
              className="add-card-textarea"
            />
            <div className="add-card-actions">
              <button onClick={handleAddCard} className="btn-add">Agregar</button>
              <button onClick={() => setIsAddingCard(false)} className="btn-cancel">Cancelar</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsAddingCard(true)} className="btn-add-card">
            <Plus size={16} /> Agregar tarjeta
          </button>
        )}
      </div>
    </div>
  );
};

export default Column;
