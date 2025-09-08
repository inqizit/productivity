import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackButton.css';

interface BackButtonProps {
  to?: string;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  to = '/', 
  className = '', 
  children = '← Back to Home',
  onClick
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(); // Execute custom onClick if provided
    } else if (to === 'back') {
      navigate(-1); // Go back to previous page
    } else {
      navigate(to);
    }
  };

    return (
        <button
            onClick={handleClick}
            className={`back-button ${className}`}
            type="button"
        >
            {children}
        </button>
    );
};

export default BackButton;
