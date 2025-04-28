import { Outlet } from "react-router-dom";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Fetch CSRF token on app initialization
    fetch('/registration/csrf/', {
      credentials: 'same-origin',
    });
  }, []);
  
  return (
    <DndProvider backend={HTML5Backend}>
      <Outlet />
    </DndProvider>
  );
}

export default App
