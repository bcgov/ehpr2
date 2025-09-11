import { AdminTab } from '@constants';
import classNames from 'classnames';

interface AdminTabFields {
  tabs: AdminTabItems[];
  categoryIndex: string;
  onTabChange: (value: AdminTab) => void;
}

interface AdminTabItems {
  title: string;
  value: AdminTab;
}

export const AdminTabs = ({ tabs, categoryIndex, onTabChange }: AdminTabFields) => {
  const getButtonClasses = (index: string): string => {
    const classes = ['text-center font-bold text-sm px-6 pt-1 pb-2 my-1'];
    if (categoryIndex === index) {
      classes.push('shadow-lg border-b-2 border-bc-blue-primary text-bc-blue-primary');
    } else {
      classes.push('border-b text-bc-gray');
    }
    return classNames(classes);
  };

  return (
    <div className='mb-5 whitespace-nowrap my-1'>
      <div className='flex justify-start'>
        {tabs.map(({ title, value }) => (
          <button
            key={title}
            id={`tab-${value.replaceAll(' ', '_')}`}
            className={getButtonClasses(value)}
            onClick={() => onTabChange(value)}
          >
            {title}
          </button>
        ))}
      </div>
    </div>
  );
};
