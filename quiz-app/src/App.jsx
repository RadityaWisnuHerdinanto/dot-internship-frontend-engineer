import { useState, useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Login from './Login'
import Quiz from './Quiz'
import Results from './Results'

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [username, setUsername] = useState('');
  const [results, setResults] = useState(null);

  useEffect(() => {
    // cek dulu user udah login belum
    const savedUser = localStorage.getItem('quizUser');
    const savedQuiz = localStorage.getItem('quizState');
    
    if (savedUser && savedQuiz) {
      // kalau ada quiz yang belum selesai, lanjutin aja
      try {
        const user = JSON.parse(savedUser);
        setUsername(user.username || user);
        setCurrentPage('quiz');
      } catch (e) {
        // kalau data corrupt, bersihin aja
        localStorage.removeItem('quizUser');
        localStorage.removeItem('quizState');
      }
    } else if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUsername(user.username || user);
      } catch (e) {
        localStorage.removeItem('quizUser');
      }
    }
  }, []);

  const handleLogin = (name) => {
    setUsername(name);
    setCurrentPage('quiz');
  };

  const handleFinish = (quizResults) => {
    setResults(quizResults);
    setCurrentPage('results');
  };

  const handleRestart = () => {
    // hapus progress quiz doang, user tetep login
    localStorage.removeItem('quizState');
    localStorage.removeItem('cachedQuestions');
    localStorage.removeItem('cacheTime');
    setResults(null);
    setCurrentPage('quiz');
  };

  const handleLogout = () => {
    // logout beneran, hapus semua
    localStorage.removeItem('quizUser');
    localStorage.removeItem('quizState');
    localStorage.removeItem('cachedQuestions');
    localStorage.removeItem('cacheTime');
    setUsername('');
    setResults(null);
    setCurrentPage('login');
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="App">
        {currentPage === 'login' && <Login onLogin={handleLogin} />}
        {currentPage === 'quiz' && <Quiz username={username} onFinish={handleFinish} onLogout={handleLogout} />}
        {currentPage === 'results' && <Results results={results} onRestart={handleRestart} onLogout={handleLogout} />}
      </div>
    </>
  );
}

export default App
