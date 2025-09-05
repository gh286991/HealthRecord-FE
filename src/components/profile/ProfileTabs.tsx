
'use client';

'use client';

'use client';

interface ProfileTabsProps {
  tabs: {
    name: string;
    content: React.ReactNode;
  }[];
  activeTab: number;
  setActiveTab: (index: number) => void;
}

export default function ProfileTabs({ tabs, activeTab, setActiveTab }: ProfileTabsProps) {
  return (
    <div className="flex space-x-2 p-1 bg-gray-200 rounded-lg">
      {tabs.map((tab, index) => (
        <button
          key={tab.name}
          onClick={() => setActiveTab(index)}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md focus:outline-none transition-colors ${
            activeTab === index
              ? 'bg-white text-black shadow'
              : 'text-gray-600 hover:bg-gray-300'
          }`}
        >
          {tab.name}
        </button>
      ))}
    </div>
  );
}
