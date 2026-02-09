import React, { useState } from 'react';
import { toast } from 'react-toastify';

const Login = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    
    // validasi input 
    if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      toast.error('Semua field harus diisi');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Password tidak cocok');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    // cek emailnya udah dipake orang lain belum
    const users = JSON.parse(localStorage.getItem('quizUsers') || '[]');
    const emailExists = users.some(user => user.email === formData.email);
    
    if (emailExists) {
      toast.error('Email sudah terdaftar');
      return;
    }

    // bikin akun baru
    const newUser = {
      email: formData.email,
      username: formData.username,
      password: formData.password // TODO: harus di-hash kalau production!
    };
    
    users.push(newUser);
    localStorage.setItem('quizUsers', JSON.stringify(users));
    
    // langsung login aja setelah register
    localStorage.setItem('quizUser', JSON.stringify(newUser));
    toast.success('Registrasi berhasil! Selamat datang!');
    onLogin(newUser.username);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Email dan password harus diisi');
      return;
    }

    // cek login match ga
    const users = JSON.parse(localStorage.getItem('quizUsers') || '[]');
    const user = users.find(u => u.email === formData.email && u.password === formData.password);
    
    if (!user) {
      toast.error('Email atau password salah');
      return;
    }

    // oke login berhasil
    localStorage.setItem('quizUser', JSON.stringify(user));
    toast.success(`Selamat datang kembali, ${user.username}!`);
    onLogin(user.username);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Quiz App</h1>
          <p className="text-gray-600">
            {isRegister ? 'Buat akun baru' : 'Masuk ke akun Anda'}
          </p>
        </div>
        
        <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="email@example.com"
              required
            />
          </div>

          {isRegister && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Masukkan username"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Masukkan password"
              required
            />
          </div>

          {isRegister && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Konfirmasi password"
                required
              />
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105"
          >
            {isRegister ? 'Daftar' : 'Masuk'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setFormData({
                email: '',
                username: '',
                password: '',
                confirmPassword: ''
              });
            }}
            className="text-blue-600 hover:text-blue-700 font-medium transition"
          >
            {isRegister ? 'Sudah punya akun? Masuk di sini' : 'Belum punya akun? Daftar di sini'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
