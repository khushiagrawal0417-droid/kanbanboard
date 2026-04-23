import React, { useState } from 'react';

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Analyze Q4 Reports', status: 'todo' },
    { id: 2, text: 'Budget Review', status: 'progress' }
  ]);

  const moveTask = (id, newStatus) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {['todo', 'progress', 'done'].map(status => (
        <div key={status} className="column">
          <h2 style={{ textTransform: 'capitalize' }}>{status}</h2>
          {tasks.filter(t => t.status === status).map(t => (
            <div key={t.id} className="card" onClick={() => moveTask(t.id, 'done')}>
              {t.text}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
