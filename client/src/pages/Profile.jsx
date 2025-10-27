import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOut,
} from '../redux/user/userSlice';

export default function Profile() {
  const { currentUser, loading } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const fileRef = useRef(null);

  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    password: '',
    profilePicture: currentUser?.profilePicture || ''
  });

  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

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
        if (trimmed && trimmed.length < 6)
          message = 'Password must be at least 6 characters';
        else if (/\s/.test(trimmed))
          message = 'Password cannot contain spaces';
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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadToCloudinary = async (file) => {
    if (!file) return null;
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: data
    });
    const json = await res.json();
    return json.secure_url || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setUpdateSuccess(false);

    const cleanData = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password.trim(),
    };

    Object.entries(cleanData).forEach(([key, value]) => validateField(key, value));
    if (Object.values(errors).some((msg) => msg)) return;

    try {
      dispatch(updateUserStart());

      let profilePictureUrl = formData.profilePicture;
      if (file) profilePictureUrl = await uploadToCloudinary(file);

      const payload = {
        ...cleanData,
        profilePicture: profilePictureUrl,
      };

      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        dispatch(updateUserFailure(data));
        setServerError(data.message || 'Failed to update profile');
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error));
      setServerError('Network error, please try again');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(deleteUserFailure(data));
        setServerError(data.message || 'Failed to delete account');
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error));
      setServerError('Network error, please try again');
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout');
      dispatch(signOut());
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <div>
          <input
            onChange={handleChange}
            value={formData.username}
            type='text'
            id='username'
            placeholder='Username'
            className='bg-slate-300 rounded-lg p-3 w-full'
          />
          {errors.username && <p className='text-red-500 text-sm mt-1'>{errors.username}</p>}
        </div>

        <div>
          <input
            onChange={handleChange}
            value={formData.email}
            type='email'
            id='email'
            placeholder='Email'
            className='bg-slate-300 rounded-lg p-3 w-full'
          />
          {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email}</p>}
        </div>

        <div>
          <input
            onChange={handleChange}
            value={formData.password}
            type='password'
            id='password'
            placeholder='Password (optional)'
            className='bg-slate-300 rounded-lg p-3 w-full'
          />
          {errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password}</p>}
        </div>

        <div>
          <label className='block mb-1'>Profile Image</label>
          <input hidden onChange={handleFileChange} ref={fileRef} type='file' accept='image/*' />
          {formData.profilePicture && !file && (
            <img onClick={() => fileRef.current.click()} src={formData.profilePicture} alt='profile' className='w-24 h-24 rounded-full mt-2' />
          )}
          {file && (
            <p className='mt-2 text-sm text-slate-600'>Selected: {file.name}</p>
          )}
        </div>

        <button
          disabled={loading}
          className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
        >
          {loading ? 'Loading...' : 'Update'}
        </button>
      </form>

      <div className='flex justify-between mt-5 text-red-700'>
        <span onClick={handleDeleteAccount} className='cursor-pointer'>Delete Account</span>
        <span onClick={handleSignOut} className='cursor-pointer'>Sign Out</span>
      </div>

      {serverError && <p className='mt-5 text-red-700'>{serverError}</p>}
      {updateSuccess && <p className='mt-5 text-green-700'>User updated successfully ✅</p>}
    </div>
  );
}

