const AnalyticsCard = ({ title, value, icon, trend, trendValue, color = 'indigo' }) => {
    const colorMap = {
      indigo: 'bg-indigo-50 text-indigo-500',
      green: 'bg-green-50 text-green-500',
      red: 'bg-red-50 text-red-500',
      yellow: 'bg-yellow-50 text-yellow-500',
      blue: 'bg-blue-50 text-blue-500'
    };
  
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-5 flex items-start gap-4 transition-shadow duration-200 hover:shadow-md">
        <div className={`w-12 h-12 ${colorMap[color] || colorMap.indigo} rounded-xl flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-500 m-0 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 m-0 mb-1">{value}</h3>
          {trendValue !== undefined && (
            <p className={`text-xs font-medium m-0 flex items-center gap-1 ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
              {trend === 'up' ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15" /></svg>
              ) : trend === 'down' ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
              ) : null}
              {trendValue}
            </p>
          )}
        </div>
      </div>
    );
  };
  
  export default AnalyticsCard;