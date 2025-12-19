import { useState, useEffect } from 'react';
import { Upload, Camera } from 'lucide-react';

interface CameraAnglesGeneratorProps {
  onGenerate: (params: any) => void;
  isGenerating: boolean;
  onGetGenerateFunction?: (fn: () => void) => void;
}

type CameraAngle = {
  id: string;
  label: string;
  prompt: string;
};

const CAMERA_ANGLES: CameraAngle[] = [
  { id: 'close_up', label: 'Close-up', prompt: 'Turn the camera to a close-up.' },
  { id: 'wide', label: 'Wide shot', prompt: 'Turn the camera to a wide-angle lens.' },
  { id: 'right_45', label: '45° Right', prompt: 'Rotate the camera 45 degrees to the right.' },
  { id: 'right_90', label: '90° Right', prompt: 'Rotate the camera 90 degrees to the right.' },
  { id: 'aerial', label: 'Aerial view', prompt: 'Turn the camera to an aerial view.' },
  { id: 'low', label: 'Low angle', prompt: 'Turn the camera to a low-angle view.' },
  { id: 'left_45', label: '45° Left', prompt: 'Rotate the camera 45 degrees to the left.' },
  { id: 'left_90', label: '90° Left', prompt: 'Rotate the camera 90 degrees to the left.' }
];

export function CameraAnglesGenerator({
  onGenerate,
  isGenerating,
  onGetGenerateFunction
}: CameraAnglesGeneratorProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedAngle, setSelectedAngle] = useState<CameraAngle | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // expose generate function to parent (PreviewPanel)
  useEffect(() => {
    if (!onGetGenerateFunction) return;

    onGetGenerateFunction(() => {
      if (!imageFile || !selectedAngle || isGenerating) return;

      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('final_prompt', selectedAngle.prompt);

      onGenerate(formData);
    });
  }, [imageFile, selectedAngle, isGenerating, onGenerate, onGetGenerateFunction]);

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const canGenerate = !!imageFile && !!selectedAngle && !isGenerating;

  return (
    <div className="p-6 space-y-6 bg-gray-800 h-full">
      {/* Upload image */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">
          Image source (obligatoire)
        </label>

        <div className="relative border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-purple-500 transition">
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleImageUpload(e.target.files[0]);
              }
            }}
            disabled={isGenerating}
          />

          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-48 mx-auto rounded-lg object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <Upload className="w-6 h-6" />
              <span className="text-sm">Cliquez pour uploader une image</span>
            </div>
          )}
        </div>
      </div>

      {/* Camera angles */}
      <div>
        <label className="block text-sm text-gray-300 mb-3">
          Angle de caméra
        </label>

        <div className="grid grid-cols-2 gap-3">
          {CAMERA_ANGLES.map((angle) => {
            const isSelected = selectedAngle?.id === angle.id;

            return (
              <button
                key={angle.id}
                type="button"
                disabled={isGenerating}
                onClick={() => setSelectedAngle(angle)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition text-sm
                  ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                  }
                  ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <Camera className="w-4 h-4" />
                {angle.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status */}
      {!canGenerate && (
        <div className="text-xs text-gray-400 pt-2">
          ⛔ Image et angle requis pour lancer la génération
        </div>
      )}
    </div>
  );
}
