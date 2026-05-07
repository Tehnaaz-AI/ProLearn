/**
 * Calculate overall course progress
 */
export const calculateCourseProgress = (sections) => {
  if (!sections || sections.length === 0) return 0;
  
  let totalLectures = 0;
  let completedLectures = 0;
  
  sections.forEach(section => {
    const lectures = section.lectures || [];
    totalLectures += lectures.length;
    completedLectures += lectures.filter(lecture => lecture.isCompleted).length;
  });
  
  if (totalLectures === 0) return 0;
  return Math.round((completedLectures / totalLectures) * 100);
};

/**
 * Calculate section progress
 */
export const calculateSectionProgress = (section) => {
  if (!section || !section.lectures || section.lectures.length === 0) return 0;
  
  const completed = section.lectures.filter(l => l.isCompleted).length;
  return Math.round((completed / section.lectures.length) * 100);
};

/**
 * Get next lecture to watch
 */
export const getNextLecture = (sections) => {
  if (!sections) return null;
  
  for (const section of sections) {
    if (!section.lectures) continue;
    
    for (const lecture of section.lectures) {
      if (!lecture.isCompleted) {
        return { ...lecture, sectionName: section.title };
      }
    }
  }
  
  return null;
};

/**
 * Get total course duration
 */
export const getTotalDuration = (sections) => {
  if (!sections) return 0;
  
  return sections.reduce((total, section) => {
    const sectionDuration = (section.lectures || []).reduce(
      (sum, lecture) => sum + (lecture.duration || 0),
      0
    );
    return total + sectionDuration;
  }, 0);
};

/**
 * Get completed lectures count
 */
export const getCompletedCount = (sections) => {
  if (!sections) return 0;
  
  return sections.reduce((count, section) => {
    return count + (section.lectures || []).filter(l => l.isCompleted).length;
  }, 0);
};

/**
 * Get total lectures count
 */
export const getTotalLecturesCount = (sections) => {
  if (!sections) return 0;
  
  return sections.reduce((count, section) => {
    return count + (section.lectures || []).length;
  }, 0);
};

/**
 * Check if course is completed
 */
export const isCourseCompleted = (sections) => {
  return calculateCourseProgress(sections) === 100;
};

/**
 * Get progress status label
 */
export const getProgressStatus = (progress) => {
  if (progress === 0) return 'Not Started';
  if (progress === 100) return 'Completed';
  if (progress < 25) return 'Just Started';
  if (progress < 50) return 'In Progress';
  if (progress < 75) return 'Halfway Through';
  return 'Almost Done';
};

/**
 * Get progress color based on percentage
 */
export const getProgressColor = (progress) => {
  if (progress === 100) return '#22c55e';
  if (progress >= 75) return '#3b82f6';
  if (progress >= 50) return '#8b5cf6';
  if (progress >= 25) return '#f59e0b';
  return '#ef4444';
};

/**
 * Estimate time remaining based on progress
 */
export const estimateTimeRemaining = (progress, totalDuration) => {
  if (progress >= 100) return 'Completed';
  
  const remainingMinutes = Math.round(totalDuration * ((100 - progress) / 100));
  
  if (remainingMinutes < 60) return `${remainingMinutes} min remaining`;
  
  const hours = Math.floor(remainingMinutes / 60);
  const mins = remainingMinutes % 60;
  
  return mins > 0 
    ? `${hours}h ${mins}m remaining` 
    : `${hours}h remaining`;
};

/**
 * Group progress data by date for chart
 */
export const groupProgressByDate = (progressHistory) => {
  if (!progressHistory || progressHistory.length === 0) return [];
  
  const grouped = {};
  
  progressHistory.forEach(entry => {
    const date = new Date(entry.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    
    if (!grouped[date]) {
      grouped[date] = 0;
    }
    grouped[date] += 1;
  });
  
  return Object.entries(grouped).map(([date, count]) => ({
    date,
    count,
  }));
};