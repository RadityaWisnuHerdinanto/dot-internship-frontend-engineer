import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const Quiz = ({ username, onFinish, onLogout }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(600); // kasih waktu 10 menit
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);

  // load data quiz yang udah disimpan, kalau gaada ambil soal baru
  useEffect(() => {
    const savedQuiz = localStorage.getItem('quizState');
    
    if (savedQuiz) {
      const quizData = JSON.parse(savedQuiz);
      setQuestions(quizData.questions);
      setCurrentQuestionIndex(quizData.currentQuestionIndex);
      setAnswers(quizData.answers);
      setTimeLeft(quizData.timeLeft);
      setLoading(false);
    } else {
      fetchQuestions();
    }
  }, []);

  // auto save progress ke localStorage biar ga ilang
  useEffect(() => {
    if (questions.length > 0) {
      const quizState = {
        questions,
        currentQuestionIndex,
        answers,
        timeLeft,
        username
      };
      localStorage.setItem('quizState', JSON.stringify(quizState));
    }
  }, [questions, currentQuestionIndex, answers, timeLeft, username]);

  // acak urutan jawaban biar ga gampang ditebak
  useEffect(() => {
    if (questions.length > 0 && questions[currentQuestionIndex]) {
      const currentQuestion = questions[currentQuestionIndex];
      const allAnswers = [
        currentQuestion.correct_answer,
        ...currentQuestion.incorrect_answers
      ];
      setShuffledAnswers(shuffleArray([...allAnswers]));
    }
  }, [currentQuestionIndex, questions]);

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const fetchQuestions = async (retryCount = 0) => {
    try {
      // cek dulu ada cache ga, lumayan buat hemat request
      const cachedQuestions = localStorage.getItem('cachedQuestions');
      const cacheTime = localStorage.getItem('cacheTime');
      
      if (cachedQuestions && cacheTime) {
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - parseInt(cacheTime) < oneHour) {
          setQuestions(JSON.parse(cachedQuestions));
          setError(null);
          setLoading(false);
          toast.info('Menggunakan soal dari cache');
          return;
        }
      }

      const response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
      const data = await response.json();
      
      if (data.response_code === 0 && data.results) {
        setQuestions(data.results);
        // simpan ke cache buat next time
        localStorage.setItem('cachedQuestions', JSON.stringify(data.results));
        localStorage.setItem('cacheTime', Date.now().toString());
        setError(null);
        setLoading(false);
      } else if (data.response_code === 5 || response.status === 429) {
        // kena rate limit nih, coba retry dulu
        if (retryCount < 2) {
          toast.warning(`Rate limited, mencoba lagi dalam ${(retryCount + 1) * 2} detik...`);
          setTimeout(() => fetchQuestions(retryCount + 1), (retryCount + 1) * 2000);
        } else {
          setError('API rate limit tercapai. Silakan tunggu beberapa saat dan coba lagi.');
          setLoading(false);
        }
      } else {
        setError('Gagal memuat soal. Silakan coba lagi.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      
      if (retryCount < 2) {
        toast.warning(`Koneksi gagal, mencoba lagi dalam ${(retryCount + 1) * 2} detik...`);
        setTimeout(() => fetchQuestions(retryCount + 1), (retryCount + 1) * 2000);
      } else {
        setError('Gagal terhubung ke server. Silakan cek koneksi internet Anda.');
        setLoading(false);
      }
    }
  };

  // timer countdown sampe habis
  useEffect(() => {
    if (timeLeft > 0 && !loading && currentQuestionIndex < questions.length) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      finishQuiz();
    }
  }, [timeLeft, loading, currentQuestionIndex]);

  const handleAnswer = (selectedAnswer) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    
    const newAnswers = [...answers, {
      question: currentQuestion.question,
      selectedAnswer,
      correctAnswer: currentQuestion.correct_answer,
      isCorrect
    }];
    
    setAnswers(newAnswers);

    // lanjut ke soal berikutnya, atau finish kalau udah abis
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = (finalAnswers = answers) => {
    const results = {
      username,
      totalQuestions: questions.length,
      answered: finalAnswers.length,
      correct: finalAnswers.filter(a => a.isCorrect).length,
      wrong: finalAnswers.filter(a => !a.isCorrect).length,
      answers: finalAnswers
    };
    localStorage.removeItem('quizState');
    onFinish(results);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const decodeHTML = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-800 text-xl font-semibold">Memuat soal...</div>
        </div>
      </div>
    );
  }

  if (error || !questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-6">{error || 'Gagal memuat soal quiz'}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchQuestions();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Hi, {username}!</h2>
              <p className="text-gray-600">
                Soal {currentQuestionIndex + 1} dari {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className={`text-3xl font-bold ${
                  timeLeft < 60 ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {formatTime(timeLeft)}
                </div>
                <p className="text-sm text-gray-600">Waktu tersisa</p>
              </div>
              <button
                onClick={() => {
                  Swal.fire({
                    title: 'Konfirmasi Logout',
                    text: 'Apakah Anda yakin ingin keluar? Progress quiz akan hilang.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3b82f6',
                    cancelButtonColor: '#ef4444',
                    confirmButtonText: 'Ya, Keluar',
                    cancelButtonText: 'Batal'
                  }).then((result) => {
                    if (result.isConfirmed) {
                      localStorage.removeItem('quizState');
                      onLogout();
                      toast.success('Berhasil logout');
                    }
                  });
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
          
          <div className="mt-2 text-sm text-gray-600">
            Terjawab: {answers.length} / {questions.length}
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-4">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
              {decodeHTML(currentQuestion.category)}
            </span>
            <span className={`ml-2 inline-block text-xs px-3 py-1 rounded-full ${
              currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
              currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {currentQuestion.difficulty}
            </span>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            {decodeHTML(currentQuestion.question)}
          </h3>

          <div className="space-y-3">
            {shuffledAnswers.map((answer, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(answer)}
                className="w-full text-left p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition duration-200 transform hover:scale-105"
              >
                <span className="font-semibold text-gray-700">
                  {String.fromCharCode(65 + index)}.
                </span>{' '}
                <span className="text-gray-800">{decodeHTML(answer)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
