import { useState, useEffect } from 'react';
import { Upload, Camera, X } from 'lucide-react';

type CameraAngle = {
  id: string;
  label: string;
  promptNode: string;
  icon: string;
};

const CAMERA_ANGLES: CameraAngle[] = [
  { id: 'close_up', label: 'Close-up', promptNode: '66', icon: '📷' },
  { id: 'wide_shot', label: 'Wide Shot', promptNode: '67', icon: '🎬' },
  { id: '45_right', label: '45° Droite', promptNode: '69', icon: '↗️' },
  { id: '90_right', label: '90° Droite', promptNode: '68', icon: '→' },
  { id: 'aerial_view', label: 'Vue Aérienne', promptNode: '70', icon: '🚁' },
  { id: 'low_angle', label: 'Contre-plongée', promptNode: '71', icon: '⬆️' },
  { id: '45_left', label: '45° Gauche', promptNode: '73', icon: '↖️' },
  { id: '90_left', label: '90° Gauche', promptNode: '72', icon: '←' },
];

interface CameraAnglesGeneratorProps {
  onGenerate: (params: any) => void;
  isGenerating: boolean;
  onGetGenerateFunction?: (fn: () => void) => void; // Ajout pour le bouton jaune
}

export function CameraAnglesGenerator({ 
  onGenerate, 
  isGenerating, 
  onGetGenerateFunction 
}: CameraAnglesGeneratorProps) {
  const [selectedAngle, setSelectedAngle] = useState<CameraAngle>(CAMERA_ANGLES[0]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImageFile(null);
  };

  // La fonction qui sera appelée par le bouton jaune du parent
  const handleGenerate = () => {
    if (!imageFile) {
      alert('Veuillez uploader une image source pour changer l\'angle.');
      return;
    }

    const seed = Math.floor(Math.random() * 1000000000);

    onGenerate({
      workflowType: 'camera-angles',
      selectedAngle: selectedAngle.id,
      promptNode: selectedAngle.promptNode,
      seed,
      steps: 4,
      cfg: 1,
      imageFile, // L'image est envoyée ici
    });
  };

  // CRUCIAL : Liaison avec le bouton jaune d'AppContent
  useEffect(() => {
    if (onGetGenerateFunction) {
      onGetGenerateFunction(handleGenerate);
    }
  }, [selectedAngle, imageFile, onGetGenerateFunction]);

  return (
    <div className="h-full bg-[#0f1117] p-6 overflow-y-auto custom-scrollbar">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
          <Camera className="w-6 h-6 text-purple-400" />
          <div>
            <h2 className="text-white text-lg font-bold">Angles de Caméra (Qwen)</h2>
            <p className="text-gray-500 text-sm">Réorientez votre image source</p>
          </div>
        </div>

        {/* Zone d'upload */}
        <div className="space-y-3">
          <label className="text-gray-400 text-xs uppercase font-bold tracking-wider">Image Source</label>
          
          {!uploadedImage ? (
            <label className="block w-full aspect-video cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isGenerating}
              />
              <div className="w-full h-full border-2 border-dashed border-gray-700 rounded-2xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all flex flex-col items-center justify-center gap-3 bg-gray-900/50">
                <Upload className="w-10 h-10 text-gray-600" />
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Cliquez pour uploader l'image</p>
                  <p className="text-gray-600 text-xs mt-1">L'IA va générer l'angle choisi à partir de celle-ci</p>
                </div>
              </div>
            </label>
          ) : (
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-gray-700 shadow-2xl">
              <img 
                src={uploadedImage} 
                alt="Source" 
                className="w-full h-full object-contain"
              />
              <button
                onClick={handleRemoveImage}
                disabled={isGenerating}
                className="absolute top-3 right-3 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-xl backdrop-blur-md transition-all shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Sélection de l'angle */}
        <div className="space-y-3">
          <label className="text-gray-400 text-xs uppercase font-bold tracking-wider">Choisir le nouvel angle</label>
          <div className="grid grid-cols-2 gap-3">
            {CAMERA_ANGLES.map((angle) => (
              <button
                key={angle.id}
                onClick={() => setSelectedAngle(angle)}
                disabled={isGenerating}
                className={`p-4 rounded-xl transition-all text-left border-2 flex items-center gap-3 ${
                  selectedAngle.id === angle.id
                    ? 'bg-purple-600/20 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'
                } disabled:opacity-40`}
              >
                <span className="text-2xl">{angle.icon}</span>
                <span className="text-sm font-medium">{angle.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Note informative */}
        <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
           <p className="text-blue-400 text-xs leading-relaxed">
             <strong>Info :</strong> Ce workflow utilise l'IA Qwen pour ré-imaginer votre image sous une perspective différente. La cohérence dépend de la complexité de l'image source.
           </p>
        </div>
      </div>
    </div>
  );
}
