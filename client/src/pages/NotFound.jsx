import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="page-center">
      <div className="empty-state">
        <div className="empty-state-icon">404</div>
        <h3>Page not found</h3>
        <p>The page you are looking for does not exist or has been moved.</p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
