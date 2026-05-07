import { useState } from 'react';
import { formatDuration, calculateSectionProgress, getProgressColor } from '../../utils/helpers';

const SectionList = ({ sections = [], onLectureSelect, currentLectureId, isEnrolled = false }) => {
  const [expandedSections, setExpandedSections] = useState(new Set([0]));

  const toggleSection = (index) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index); else newSet.add(index);
      return newSet;
    });
  };

  if (sections.length === 0) return <div className="p-10 text-center text-gray-500">No sections available yet.</div>;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 m-0">Course Content</h3>
        <span className="text-sm text-gray-500">{sections.length} sections • {sections.reduce((acc, s) => acc + (s.lectures?.length || 0), 0)} lectures</span>
      </div>

      {sections.map((section, sectionIndex) => {
        const isExpanded = expandedSections.has(sectionIndex);
        const progress = isEnrolled ? calculateSectionProgress(section) : 0;
        const lecturesCount = section.lectures?.length || 0;

        return (
          <div key={section._id || sectionIndex} className="border-b border-gray-100 last:border-b-0">
            <button onClick={() => toggleSection(sectionIndex)} className="w-full flex justify-between items-center p-5 border-none bg-transparent cursor-pointer text-left hover:bg-gray-50/50 transition-colors" aria-expanded={isExpanded}>
              <div className="flex items-start gap-3">
                <svg className={`w-5 h-5 text-gray-400 shrink-0 mt-0.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 m-0">{section.title}</h4>
                  <span className="text-[13px] text-gray-500 mt-0.5 block">{lecturesCount} lectures • {formatDuration(section.duration || 0)}</span>
                </div>
              </div>
              {isEnrolled && (
                <span className="text-[13px] font-semibold px-2.5 py-1 rounded-full" style={{ color: getProgressColor(progress), backgroundColor: `${getProgressColor(progress)}1A` }}>
                  {progress}%
                </span>
              )}
            </button>

            {isExpanded && (
              <div className="px-5 pb-4">
                {section.lectures?.map((lecture, lectureIndex) => {
                  const isCurrent = lecture._id === currentLectureId;
                  const isCompleted = lecture.isCompleted;
                  return (
                    <button key={lecture._id || lectureIndex} onClick={() => onLectureSelect?.(lecture, section)} disabled={!isEnrolled}
                      className={`w-full flex justify-between items-center p-3 border-none rounded-lg mb-1 cursor-pointer text-left transition-all duration-150
                        ${isCurrent ? 'bg-indigo-50' : 'bg-transparent hover:bg-gray-50'}
                        ${isCompleted ? '' : ''}
                        ${!isEnrolled ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        {isCompleted ? (
                          <svg className="w-5 h-5 text-green-500 shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                        ) : (
                          <span className="w-7 h-7 flex items-center justify-center text-xs text-gray-500 bg-gray-100 rounded-full shrink-0">{lectureIndex + 1}</span>
                        )}
                        <div className="flex flex-col gap-0.5">
                          <span className={`text-sm ${isCurrent ? 'text-indigo-600 font-medium' : isCompleted ? 'text-gray-400' : 'text-gray-700'}`}>{lecture.title}</span>
                          {lecture.duration && <span className="text-xs text-gray-400">{formatDuration(lecture.duration)}</span>}
                        </div>
                      </div>
                      
                      {lecture.isPreview && !isEnrolled && <span className="text-[11px] font-semibold text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded uppercase">Preview</span>}
                      {!isEnrolled && !lecture.isPreview && (
                        <svg className="w-4 h-4 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SectionList;