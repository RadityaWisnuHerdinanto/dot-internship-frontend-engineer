import React from 'react';

const Results = ({ results, onRestart, onLogout }) => {
  const { username, totalQuestions, answered, correct, wrong } = results;
  const percentage = totalQuestions > 0 ? ((correct / totalQuestions) * 100).toFixed(1) : 0;

  const getGrade = () => {
    if (percentage >= 80) return { grade: 'A', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (percentage >= 70) return { grade: 'B', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (percentage >= 60) return { grade: 'C', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (percentage >= 50) return { grade: 'D', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { grade: 'E', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const gradeInfo = getGrade();

  const decodeHTML = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Results Summary */}
        <div className="bg-white rounded-lg shadow-2xl p-8 mb-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Quiz Selesai!</h1>
            <p className="text-xl text-gray-600">Selamat, {username}!</p>
          </div>

          {/* Score Circle */}
          <div className="flex justify-center mb-8">
            <div className={`w-48 h-48 rounded-full ${gradeInfo.bgColor} flex items-center justify-center`}>
              <div className="text-center">
                <div className={`text-6xl font-bold ${gradeInfo.color}`}>{percentage}%</div>
                <div className={`text-2xl font-semibold ${gradeInfo.color}`}>Grade {gradeInfo.grade}</div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{totalQuestions}</div>
              <div className="text-gray-600 font-medium">Total Soal</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{correct}</div>
              <div className="text-gray-600 font-medium">Jawaban Benar</div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">{wrong}</div>
              <div className="text-gray-600 font-medium">Jawaban Salah</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Soal Terjawab:</span>
              <span className="text-2xl font-bold text-gray-800">{answered} / {totalQuestions}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(answered / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onRestart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 transform hover:scale-105"
            >
              Mulai Quiz Baru
            </button>
            <button
              onClick={onLogout}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Detailed Answers */}
        {results.answers && results.answers.length > 0 && (
          <div className="bg-white rounded-lg shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Detail Jawaban</h2>
            
            <div className="space-y-4">
              {results.answers.map((answer, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    answer.isCorrect
                      ? 'border-green-300 bg-green-50'
                      : 'border-red-300 bg-red-50'
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      answer.isCorrect ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {index + 1}
                    </div>
                    
                    <div className="ml-4 flex-grow">
                      <p className="font-semibold text-gray-800 mb-2">
                        {decodeHTML(answer.question)}
                      </p>
                      
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-700">
                          <span className="font-medium">Jawaban Anda:</span>{' '}
                          <span className={answer.isCorrect ? 'text-green-700' : 'text-red-700'}>
                            {decodeHTML(answer.selectedAnswer)}
                          </span>
                        </p>
                        
                        {!answer.isCorrect && (
                          <p className="text-gray-700">
                            <span className="font-medium">Jawaban Benar:</span>{' '}
                            <span className="text-green-700">
                              {decodeHTML(answer.correctAnswer)}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 ml-4">
                      {answer.isCorrect ? (
                        <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
