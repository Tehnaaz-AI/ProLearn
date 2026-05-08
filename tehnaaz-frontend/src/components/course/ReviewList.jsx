import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import reviewService from '../../services/reviewService';
import { formatDate, getStarArray, getInitials } from '../../utils/helpers';

const ReviewList = ({ courseId }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ rating: 0, comment: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchReviews(); if (isAuthenticated) fetchUserReview(); }, [courseId, isAuthenticated]);

  const fetchReviews = async () => { try { setLoading(true); const data = await reviewService.getCourseReviews(courseId); setReviews(data.reviews || data); } catch (err) { setError(err.message); } finally { setLoading(false); }};
  const fetchUserReview = async () => { try { const data = await reviewService.checkUserReview(courseId); if (data) { setUserReview(data); setFormData({ rating: data.rating, comment: data.comment }); } } catch {} };

  const handleSubmit = async (e) => {
    e.preventDefault(); if (formData.rating === 0) return;
    try {
      setSubmitting(true);
      if (userReview) { const updated = await reviewService.updateReview(courseId, userReview._id, formData); setUserReview(updated); }
      else { const newReview = await reviewService.addReview(courseId, formData); setUserReview(newReview); setReviews(prev => [newReview, ...prev]); }
      setShowForm(false);
    } catch (err) { setError(err.message); } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!userReview || !window.confirm('Delete your review?')) return;
    try { await reviewService.deleteReview(courseId, userReview._id); setUserReview(null); setFormData({ rating: 0, comment: '' }); fetchReviews(); } catch (err) { setError(err.message); }
  };

  const calculateAverage = () => reviews.length === 0 ? 0 : (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);
  const getRatingDistribution = () => { const d = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }; reviews.forEach(r => { d[r.rating] = (d[r.rating] || 0) + 1; }); return d; };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading reviews...</div>;

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 m-0">Reviews</h3>
        {isAuthenticated && <button onClick={() => setShowForm(!showForm)} className="px-5 py-2 border border-indigo-500 bg-transparent text-indigo-500 rounded-lg text-sm font-medium cursor-pointer hover:bg-indigo-500 hover:text-white transition-all">{userReview ? 'Edit Review' : 'Write a Review'}</button>}
      </div>

      {reviews.length > 0 && (
        <div className="flex gap-10 p-6 bg-gray-50 rounded-xl mb-6 flex-col md:flex-row">
          <div className="flex flex-col items-center min-w-[100px]">
            <span className="text-5xl font-bold text-gray-900 leading-none">{calculateAverage()}</span>
            <div className="my-2 flex">{getStarArray(parseFloat(calculateAverage())).map((type, i) => <span key={i} className={`text-base ${type === 'full' || type === 'half' ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>)}</div>
            <span className="text-[13px] text-gray-500">{reviews.length} reviews</span>
          </div>
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map(star => { const dist = getRatingDistribution(); const count = dist[star] || 0; const p = reviews.length > 0 ? (count / reviews.length) * 100 : 0; return (
              <div key={star} className="flex items-center gap-2 mb-1.5">
                <span className="text-[13px] text-gray-500 min-w-[20px]">{star}★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-yellow-400 rounded-full transition-all duration-300" style={{ width: `${p}%` }} /></div>
                <span className="text-[13px] text-gray-500 min-w-[20px] text-right">{count}</span>
              </div>
            );})}
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 border border-gray-200 rounded-xl mb-6">
          <h4 className="text-base font-semibold m-0 mb-4">{userReview ? 'Update Your Review' : 'Write a Review'}</h4>
          <div className="flex gap-2 mb-4">{[1,2,3,4,5].map(star => (
            <button key={star} type="button" onClick={() => setFormData(p => ({...p, rating: star}))} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
              className={`text-3xl bg-transparent border-none cursor-pointer p-0 transition-colors ${star <= (hoverRating || formData.rating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</button>
          ))}</div>
          <textarea className="w-full p-3 border border-gray-200 rounded-lg font-[inherit] text-sm resize-y mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="Share your experience..." value={formData.comment} onChange={(e) => setFormData(p => ({...p, comment: e.target.value}))} rows={4} required />
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border-none bg-gray-100 text-gray-600 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={formData.rating === 0 || submitting} className="px-5 py-2.5 border-none bg-indigo-500 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-indigo-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">{submitting ? 'Submitting...' : 'Submit'}</button>
          </div>
          {userReview && <button type="button" onClick={handleDelete} className="mt-3 px-3 py-1.5 border-none bg-transparent text-red-500 text-[13px] cursor-pointer">Delete Review</button>}
        </form>
      )}

      <div className="space-y-0">
        {userReview && !showForm && (
          <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-xl mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-semibold overflow-hidden shrink-0">{user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover"/> : getInitials(user?.name)}</div>
              <div className="flex-1"><span className="font-semibold text-sm block">{user?.name} (You)</span><div className="flex mt-0.5">{getStarArray(userReview.rating).map((t,i) => <span key={i} className={`text-sm ${t!=='empty' ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>)}</div></div>
              <span className="text-[13px] text-gray-500">{formatDate(userReview.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed m-0">{userReview.comment}</p>
          </div>
        )}
        {reviews.filter(r => !userReview || r._id !== userReview._id).map(r => (
          <div key={r._id} className="py-5 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-semibold overflow-hidden shrink-0">{r.user?.avatar ? <img src={r.user.avatar} alt="" className="w-full h-full object-cover"/> : getInitials(r.user?.name)}</div>
              <div className="flex-1"><span className="font-semibold text-sm block">{r.user?.name}</span><div className="flex mt-0.5">{getStarArray(r.rating).map((t,i) => <span key={i} className={`text-sm ${t!=='empty' ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>)}</div></div>
              <span className="text-[13px] text-gray-500">{formatDate(r.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed m-0">{r.comment}</p>
          </div>
        ))}
        {reviews.length === 0 && !userReview && <div className="p-10 text-center text-gray-500">No reviews yet.</div>}
      </div>
      {error && <div className="p-3 bg-red-50 text-red-500 rounded-lg text-sm mt-4">{error}</div>}
    </div>
  );
};

export default ReviewList;