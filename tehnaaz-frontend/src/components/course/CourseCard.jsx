import { Link } from 'react-router-dom';
import { formatCurrency, formatDuration, formatNumber, getStarArray, getDiscountPercentage } from '../../utils/helpers';

const CourseCard = ({ course }) => {
  const { _id, title, thumbnail, instructor, category, rating, reviewCount, studentCount, price, originalPrice, isPaid, duration, level } = course || {};
  const stars = getStarArray(rating || 0);
  const discount = getDiscountPercentage(originalPrice, price);
  const displayPrice = isPaid ? price : 0;

  return (
    <Link to={`/courses/${_id}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-transparent">
      <div className="relative aspect-video overflow-hidden">
        <img src={thumbnail || '/placeholder-course.jpg'} alt={title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
        <div className="absolute top-3 left-3 flex gap-2">
          {isPaid ? (discount > 0 && <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-red-500 text-white">{discount}% OFF</span>) : <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-green-500 text-white">FREE</span>}
          {level && <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-black/70 text-white backdrop-blur-sm">{level}</span>}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-2">{category?.name || category}</p>
        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug">{title}</h3>
        <p className="text-[13px] text-gray-500 mb-3">{instructor?.name || 'Unknown Instructor'}</p>

        <div className="flex items-center gap-1 mb-3">
          <div className="flex">{stars.map((type, i) => <span key={i} className={`text-sm ${type === 'full' || type === 'half' ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>)}</div>
          <span className="text-sm font-semibold text-gray-900 ml-1">{rating?.toFixed(1) || '0.0'}</span>
          <span className="text-xs text-gray-500">({formatNumber(reviewCount || 0)})</span>
        </div>

        <div className="flex gap-4 mb-4 text-xs text-gray-500">
          {duration && (
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              {formatDuration(duration)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
            {formatNumber(studentCount || 0)}
          </span>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2">
            {isPaid ? (
              <>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(displayPrice)}</span>
                {originalPrice > price && <span className="text-sm text-gray-500 line-through">{formatCurrency(originalPrice)}</span>}
              </>
            ) : <span className="text-lg font-bold text-green-500">Free</span>}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;