import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';

function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let message = '';
    const trimmed = value.trim();

    switch (name) {
      case 'username':
        if (!trimmed) message = 'Username is required';
        else if (/\s/.test(trimmed)) message = 'Username cannot contain spaces';
        else if (trimmed.length < 3)
          message = 'Username must be at least 3 characters long';
        break;

      case 'email':
        if (!trimmed) message = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
          message = 'Invalid email format';
        break;

      case 'password':
        if (!trimmed) message = 'Password is required';
        else if (/\s/.test(trimmed)) message = 'Password cannot contain spaces';
        else if (trimmed.length < 6)
          message = 'Password must be at least 6 characters';
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    validateField(id, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const cleanData = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password.trim(),
    };

    Object.entries(cleanData).forEach(([key, value]) => validateField(key, value));
    if (Object.values(errors).some((msg) => msg)) return;

    try {
      setLoading(true);
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData), 
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setServerError(data.message || 'Registration failed');
        return;
      }

      navigate('/sign-in');
    } catch (error) {
      setLoading(false);
      setServerError('Network error, please try again');
    }
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'>Sign Up</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <div>
          <input
            id='username'
            type='text'
            placeholder='Username'
            value={formData.username}
            onChange={handleChange}
            className='bg-slate-100 p-3 rounded-lg w-full'
          />
          {errors.username && (
            <p className='text-red-500 text-sm mt-1'>{errors.username}</p>
          )}
        </div>

        <div>
          <input
            id='email'
            type='email'
            placeholder='Email'
            value={formData.email}
            onChange={handleChange}
            className='bg-slate-100 p-3 rounded-lg w-full'
          />
          {errors.email && (
            <p className='text-red-500 text-sm mt-1'>{errors.email}</p>
          )}
        </div>

        <div>
          <input
            id='password'
            type='password'
            placeholder='Password'
            value={formData.password}
            onChange={handleChange}
            className='bg-slate-100 p-3 rounded-lg w-full'
          />
          {errors.password && (
            <p className='text-red-500 text-sm mt-1'>{errors.password}</p>
          )}
        </div>

        <button
          disabled={loading}
          className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
        >
          {loading ? 'Loading...' : 'Sign up'}
        </button>
        <OAuth />
      </form>

      <div className='flex gap-1 mt-5'>
        <p>Have an account?</p>
        <Link to='/sign-in'>
          <span className='text-blue-500'>Sign in</span>
        </Link>
      </div>

      {serverError && <p className='text-red-500 mt-5'>{serverError}</p>}
    </div>
  );
}

export default SignUp;

