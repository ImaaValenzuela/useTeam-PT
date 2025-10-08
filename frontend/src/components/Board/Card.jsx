import React, { useEffect, useRef, useState } from 'react';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Trash2, Edit2, Save, X } from 'lucide-react';
import './Card.css';

const Card = ({ card, index, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const cardRef = useRef(null);

  // Habilitar arrastre con Atlaskit
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    el.dataset.cardId = card._id; // Necesario para dropTarget
    const cleanup = draggable({ element: el });
    return cleanup;
  }, [card._id]);

  const handleSave = () => {
    if (title.trim()) {
      onUpdate(card._id, { title, description });
      setIsEditing(false);
    }
  };

  return (
    <div ref={cardRef} className="card">
      {isEditing ? (
        <div className="card-edit">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="card-title-input"
            autoFocus
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="card-description-input"
            rows={3}
          />
          <div className="card-actions">
            <button onClick={handleSave} className="btn-save">
              <Save size={16} /> Guardar
            </button>
            <button onClick={() => setIsEditing(false)} className="btn-cancel">
              <X size={16} /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="card-view">
          <h4 className="card-title">{card.title}</h4>
          {card.description && <p className="card-description">{card.description}</p>}
          <div className="card-footer">
            <span>{new Date(card.createdAt).toLocaleDateString()}</span>
            <div className="card-actions">
              <button onClick={() => setIsEditing(true)} className="btn-icon">
                <Edit2 size={14} />
              </button>
              <button onClick={() => onDelete(card._id)} className="btn-icon">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;
