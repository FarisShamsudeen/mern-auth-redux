import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
} from '../redux/user/userSlice';


export default function Profile() {
  const { currentUser, loading, error } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const [updateSuccess, setUpdateSuccess] = useState(false)

  const [formData, setFromData] = useState({})

  const handleChange = (e) => {
    setFromData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart())
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data))
        return;
      }
      dispatch(updateUserSuccess(data))
      setUpdateSuccess(true)
    } catch (error) {
      dispatch(updateUserFailure(error))
    }
  }

  const handleDeleteAccount = async () => {
    try {
      dispatch(deleteUserStart())
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success === false) {
        dispatch(deleteUserFailure(data))
        return;
      }
      dispatch(deleteUserSuccess(data))
    } catch (error) {
      dispatch(deleteUserFailure(error))
    }
  }

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input onChange={handleChange} defaultValue={currentUser.username} type='text' id='username' placeholder='Username' className='bg-slate-300 rounded-lg p-3' />
        <input onChange={handleChange} defaultValue={currentUser.email} type='email' id='email' placeholder='Email' className='bg-slate-300 rounded-lg p-3' />
        <input onChange={handleChange} type='password' id='password' placeholder='Password' className='bg-slate-300 rounded-lg p-3' />
        <button disabled={loading} className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>
          {loading ? 'Loading...' : 'Update'}
        </button>
      </form>
      <div className='flex justify-between mt-5 text-red-700'>
        <span onClick={handleDeleteAccount} className='cursor-pointer'>Delete Account</span>
        <span className='cursor-pointer'>Sign Out</span>
      </div>
      <p className='mt-5 text-red-700'>
        {error && "Something went wrong"}
      </p>
      <p className='mt-5 text-green-700'>
        {updateSuccess && "User is updated successfully"}
      </p>
    </div>
  )
}


