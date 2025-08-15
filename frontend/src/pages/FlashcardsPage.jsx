import { useState } from 'react';
import FlashcardManager from '../components/flashcards/FlashcardManager';
import FlashcardBrowser from '../components/flashcards/FlashcardBrowser';
import FlashcardViewer from '../components/flashcards/FlashcardViewer';
//This is FlashcardPage.jsx
const FlashcardsPage = () => {
  const [activeTab, setActiveTab] = useState('browse');

  const tabs = [
    { id: 'browse', label: 'Browse Cards', component: FlashcardBrowser },
    { id: 'study', label: 'Study Mode', component: FlashcardViewer },
    { id: 'manage', label: 'My Cards', component: FlashcardManager }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab Navigation */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};

export default FlashcardsPage;