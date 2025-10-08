import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Board from './components/Board/Board';
import ExportButton from './components/ExportButton/ExportButton';
import { Users } from 'lucide-react';
import { useKanban } from './hooks/useKanban';
import './App.css';

function App() {
  const { connectedUsers } = useKanban();

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>📊 Tablero Kanban Colaborativo</h1>
          <div className="users-indicator">
            <Users size={18} />
            <span>{connectedUsers} usuario{connectedUsers !== 1 ? 's' : ''} conectado{connectedUsers !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="header-right">
          <ExportButton />
        </div>
      </header>

      <main className="app-main">
        <Board />
      </main>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;