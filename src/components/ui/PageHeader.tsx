
import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, icon }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center">
        {icon && <div className="mr-3 text-primary">{icon}</div>}
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      </div>
      {description && (
        <p className="mt-2 text-lg text-gray-600">{description}</p>
      )}
      <div className="mt-4 h-1 w-20 bg-primary rounded-full"></div>
    </div>
  );
};

export default PageHeader;
