import React, { useState } from 'react';
import { Download, X, Mail } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './ExportButton.css';

const ExportButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExport = async (e) => {
    e.preventDefault();

    // Validar email
    if (!email || !email.includes('@')) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/export/backlog', { email });
      
      toast.success(
        `✅ Exportación iniciada. El CSV será enviado a ${email}`,
        { autoClose: 5000 }
      );
      
      setShowModal(false);
      setEmail('');
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error(
        error.response?.data?.message || 'Error al exportar el backlog'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEmail('');
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} className="export-btn">
        <Download size={18} />
        Exportar Backlog
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <Mail size={24} />
                Exportar Backlog a Email
              </h2>
              <button onClick={handleClose} className="btn-close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleExport} className="modal-body">
              <p className="modal-description">
                Ingresa el email donde deseas recibir el archivo CSV con todas
                las tarjetas del tablero.
              </p>

              <div className="form-group">
                <label htmlFor="email">Email de destino</label>
                <input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="input-email"
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar CSV'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ExportButton;