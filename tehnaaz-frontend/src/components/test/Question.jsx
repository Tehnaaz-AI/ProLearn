const Question = ({ question, index, selectedAnswer, onAnswerSelect, showResult = false }) => {
    const { text, options } = question;
    const getOptionLetter = (i) => String.fromCharCode(65 + i);
  
    const getOptionStyles = (optIndex) => {
      let base = "flex items-center gap-3 p-3.5 border-2 rounded-xl bg-white cursor-pointer text-left transition-all duration-150 text-[15px]";
      if (showResult) {
        if (optIndex === question.correctAnswer) base += " border-green-500 bg-green-50/50";
        else if (selectedAnswer === optIndex && optIndex !== question.correctAnswer) base += " border-red-500 bg-red-50/50";
        else base += " border-gray-100 cursor-default";
      } else {
        base += selectedAnswer === optIndex ? " border-indigo-500 bg-indigo-50/50" : " border-gray-100 hover:border-gray-300 hover:bg-gray-50";
      }
      return base;
    };
  
    return (
      <div className="p-6 bg-white border border-gray-100 rounded-2xl mb-5">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[13px] font-semibold text-indigo-500 uppercase tracking-wide">Question {index + 1}</span>
          {question.points && <span className="text-[13px] text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{question.points} pts</span>}
        </div>
  
        <h4 className="text-[17px] font-medium text-gray-900 m-0 mb-5 leading-relaxed">{text}</h4>
  
        <div className="flex flex-col gap-2.5">
          {options?.map((option, optIndex) => (
            <button key={optIndex} onClick={() => !showResult && onAnswerSelect(question._id, optIndex)} disabled={showResult} className={getOptionStyles(optIndex)}>
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0
                ${showResult && optIndex === question.correctAnswer ? 'bg-green-500 text-white' : 
                  showResult && selectedAnswer === optIndex && optIndex !== question.correctAnswer ? 'bg-red-500 text-white' : 
                  selectedAnswer === optIndex ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {getOptionLetter(optIndex)}
              </span>
              <span className="flex-1 text-gray-700">{option}</span>
              {showResult && optIndex === question.correctAnswer && (
                <svg className="w-5 h-5 text-green-500 ml-auto shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
              )}
              {showResult && selectedAnswer === optIndex && optIndex !== question.correctAnswer && (
                <svg className="w-5 h-5 text-red-500 ml-auto shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              )}
            </button>
          ))}
        </div>
  
        {showResult && question.explanation && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl border-l-[3px] border-blue-400">
            <h5 className="text-sm font-semibold text-blue-700 m-0 mb-2">Explanation</h5>
            <p className="text-sm text-blue-600/80 leading-relaxed m-0">{question.explanation}</p>
          </div>
        )}
      </div>
    );
  };
  
  export default Question;