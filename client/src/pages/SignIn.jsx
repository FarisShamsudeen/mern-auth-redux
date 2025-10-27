import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import OAuth from '../components/OAuth';

function SignIn() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const { loading } = useSelector((state) => state.user);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validateField = (name, value) => {
    let message = '';
    const trimmed = value.trim();

    if (name === 'email') {
      if (!trimmed) message = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
        message = 'Invalid email format';
    }

    if (name === 'password') {
      if (!trimmed) message = 'Password is required';
      else if (/\s/.test(trimmed)) message = 'Password cannot contain spaces';
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
      email: formData.email.trim(),
      password: formData.password.trim(),
    };


    Object.entries(cleanData).forEach(([key, value]) => validateField(key, value));
    if (Object.values(errors).some((msg) => msg)) return;

    try {
      dispatch(signInStart());
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData),
      });
      const data = await res.json();

      if (!res.ok) {
        dispatch(signInFailure(data));
        setServerError(data.message || 'Invalid credentials');
        return;
      }

      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      dispatch(signInFailure(error));
      setServerError('Network error, please try again');
    }
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'>Sign In</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
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
          {loading ? 'Loading...' : 'Sign in'}
        </button>

        <OAuth />
      </form>

      <div className='flex gap-1 mt-5'>
        <p>Don{"'"}t have an account?</p>
        <Link to='/sign-up'>
          <span className='text-blue-500'>Sign up</span>
        </Link>
      </div>

      {serverError && <p className='text-red-500 mt-5'>{serverError}</p>}
    </div>
  );
}

export default SignIn;

