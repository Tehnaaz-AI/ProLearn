import { getProgressColor } from '../../utils/helpers';

const ProgressBar = ({ 
  progress = 0, 
  size = 'md', 
  showLabel = true, 
  label = '',
  color 
}) => {
  const progressColor = color || getProgressColor(progress);
  
  const sizes = {
    sm: { container: 'h-1.5', text: 'text-xs' },
    md: { container: 'h-2.5', text: 'text-sm' },
    lg: { container: 'h-4', text: 'text-base' },
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className={`font-medium text-gray-700 m-0 ${currentSize.text}`}>{label}</span>}
          {showLabel && <span className={`font-semibold m-0 ${currentSize.text}`} style={{ color: progressColor }}>{progress}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${!label && !showLabel ? 'mb-0' : ''}`}>
        <div 
          className={`${currentSize.container} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${progress}%`, backgroundColor: progressColor }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;