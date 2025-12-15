import { Settings, Image as ImageIcon } from 'lucide-react';

interface WorkflowSelectorProps {
  currentWorkflow: 'parameters' | 'poster';
  onWorkflowChange: (workflow: 'parameters' | 'poster') => void;
}

export function WorkflowSelector({ currentWorkflow, onWorkflowChange }: WorkflowSelectorProps) {
  return (
    <div className="p-6 border-b border-gray-700">
      <div className="flex gap-3">
        <button
          onClick={() => onWorkflowChange('parameters')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors ${
            currentWorkflow === 'parameters'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-650'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm">Paramètres de Génération</span>
        </button>
        
        <button
          onClick={() => onWorkflowChange('poster')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors ${
            currentWorkflow === 'poster'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-650'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span className="text-sm">Générateur d'Affiches</span>
        </button>
      </div>
      
      <p className="text-xs text-gray-400 mt-3">
        {currentWorkflow === 'parameters' 
          ? 'Sélectionnez un flux de travail simple, puis ajustez le prompt et les paramètres.'
          : 'Mode: Flux de travail unifié/parameters'}
      </p>
    </div>
  );
}
