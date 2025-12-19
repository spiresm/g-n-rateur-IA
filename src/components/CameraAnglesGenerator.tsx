import { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, AlertTriangle } from 'lucide-react';

type AngleKey =
  | 'close_up'
  | 'wide_shot'
  | '45_right'
  | '90_right'
  | 'aerial_view'
  | 'low_angle'
  | '45_left'
  | '90_left';

type AngleOption = {
  key: AngleKey;
  label: string;
  prompt: string;
};

const ANGLES: AngleOption[] = [
  { key: 'close_up', label: 'Close-up', prompt: 'Turn the camera to a close-up.' },
  { key: 'wide_shot', label: 'Wide shot', prompt: 'Turn the camera to a wide-angle lens.' },
  { key: '45_right', label: '45° droite', prompt: 'Rotate the camera 45 degrees to the right.' },
  { key: '90_right', label: '90° droite', prompt: 'Rotate the camera 90 degrees to the right.' },
  { key: 'aerial_view', label: 'Vue aérienne', prompt: 'Turn the camera to an aerial view.' },
  { key: 'low_angle', label: 'Contre-plongée', prompt: 'Turn the camera to a low-angle view.' },
  { key: '45_left', label: '45° gauche', prompt: 'Rotate the camera 45 degrees to the left.' },
  { key: '90_left', label: '90° gauche', prompt: 'Rotate the camera 90 degrees to the left.' },
];

interface CameraAnglesGeneratorProps {
  onGenerate: (params: any) => void;
  isGenerating: boolean;
  onGetGenerateFunction?: (fn: () => void) => void;
}

export function CameraAnglesGenerator({
  onGenerate,
  isGenerating,
  onGetGenerateFunction,
}: CameraAnglesGeneratorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedAngle, setSelectedAngle] = useState<AngleKey | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const selectedAngleObj = useMemo(
    () => ANGLES.find(a => a.key === selectedAngle) || null,
    [selectedAngle]
  );

  const isReady = Boolean(imageBase64) && Boolean(selectedAngle);

  const readFileAsBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handlePickFile = () => {
    setErrorMsg('');
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Sécurité basique
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Le fichier doit être une image (png, jpg, webp, …).');
      e.target.value = '';
      return;
    }

    // Optionnel: limite poids (ex: 10MB)
    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMsg('Image trop lourde (max 10MB).');
      e.target.value = '';
      return;
    }

    try {
      const base64 = await readFileAsBase64(file);
      setImageBase64(base64);
      setImagePreview(base64);
    } catch {
      setErrorMsg("Impossible de lire l'image.");
    } finally {
      e.target.value = '';
    }
  };

  const handleGenerate = () => {
    setErrorMsg('');

    if (!imageBase64) {
      setErrorMsg('Upload une image pour continuer.');
      return;
    }
    if (!selectedAngleObj) {
      setErrorMsg('Choisis un angle avant de générer.');
      return;
    }

    // ✅ Params attendus côté backend (adaptable si besoin)
    onGenerate({
      image: imageBase64,
      angle: selectedAngleObj.key,
      prompt: selectedAngleObj.prompt,
    });
  };

  // Expose la fonction "Générer" au bouton de droite (PreviewPanel)
  useEffect(() => {
    onGetGenerateFunction?.(() => {
      // On bloque si pas prêt
      if (!isReady || isGenerating) {
        setErrorMsg(
          !imageBase64
            ? 'Upload une image pour activer la génération.'
            : 'Choisis un angle pour activer la génération.'
        );
        return;
      }
      handleGenerate();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onGetGenerateFunction, isReady, isGenerating, imageBase64, selectedAngle]);

  return (
    <div className="p-6 text-white">
      <div className="mb-4">
        <h2 className="text-2xl font-black text-purple-400 uppercase">Angle de caméra</h2>
        <p className="text-gray-300 mt-2 text-sm">
          Upload une image, puis choisis un angle avant de générer l’image.
        </p>
      </div>

      {/* Upload */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 uppercase font-bold">Image source</span>
          {imageBase64 && (
            <button
              type="button"
              onClick={() => {
                setImageBase64('');
                setImagePreview('');
              }}
              disabled={isGenerating}
              className="text-xs text-gray-400 hover:text-white underline disabled:opacity-50"
            >
              Retirer
            </button>
          )}
        </div>

        <div className="bg-gray-900/40 border border-gray-700 rounded-xl p-4">
          {!imagePreview ? (
            <button
              type="button"
              onClick={handlePickFile}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-3 py-10 rounded-lg border-2 border-dashed border-gray-700 hover:border-gray-500 transition disabled:opacity-60"
            >
              <Upload className="w-5 h-5 text-gray-300" />
              <span className="text-gray-300 text-sm">
                Cliquer pour uploader une image
              </span>
            </button>
          ) : (
            <div className="flex gap-4 items-start">
              <img
                src={imagePreview}
                alt="Aperçu"
                className="w-28 h-28 object-cover rounded-lg border border-gray-700"
              />
              <div className="flex-1">
                <div className="text-sm text-gray-200 font-semibold mb-2">
                  Image chargée ✅
                </div>
                <button
                  type="button"
                  onClick={handlePickFile}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm disabled:opacity-60"
                >
                  Changer l’image
                </button>
                <div className="mt-2 text-xs text-gray-500">
                  Formats conseillés : PNG/JPG/WEBP — max 10MB
                </div>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Angles */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 uppercase font-bold mb-2">
          Choix de l’angle (1 seul)
        </div>

        <div className="grid grid-cols-2 gap-3">
          {ANGLES.map((a) => {
            const active = selectedAngle === a.key;
            return (
              <button
                key={a.key}
                type="button"
                onClick={() => setSelectedAngle(a.key)}
                disabled={isGenerating}
                className={`py-3 rounded-lg border transition text-sm font-semibold ${
                  active
                    ? 'bg-purple-600/20 border-purple-500 text-white'
                    : 'bg-gray-900/30 border-gray-700 text-gray-200 hover:border-gray-500'
                } ${isGenerating ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {a.label}
              </button>
            );
          })}
        </div>

        {!isReady && (
          <div className="mt-4 flex items-center gap-2 text-yellow-400 text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>
              {!imageBase64
                ? 'Upload une image pour activer la génération'
                : 'Sélectionne un angle pour activer la génération'}
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 text-red-400 text-sm">{errorMsg}</div>
        )}
      </div>

      {/* (Optionnel) bouton local aussi, si tu veux tester sans PreviewPanel */}
      <div className="mt-6">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!isReady || isGenerating}
          className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold"
        >
          {isGenerating ? 'Génération…' : 'Générer'}
        </button>
      </div>
    </div>
  );
}
