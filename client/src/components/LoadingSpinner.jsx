const LoadingSpinner = ({ label = 'Loading...' }) => (
  <div className="loading-wrap">
    <div className="spinner" />
    <p>{label}</p>
  </div>
);

export default LoadingSpinner;
