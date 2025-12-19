export function CameraAnglesGenerator({
  onGenerate,
  isGenerating,
  onGetGenerateFunction,
}: {
  onGenerate: (params: any) => void;
  isGenerating: boolean;
  onGetGenerateFunction: (fn: () => void) => void;
}) {
  const [selectedAngle, setSelectedAngle] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // expose la fonction au parent
  useEffect(() => {
    onGetGenerateFunction(() => {
      if (!imageFile || !selectedAngle) return;

      onGenerate({
        image: imageFile,
        angle: selectedAngle,
      });
    });
  }, [imageFile, selectedAngle, onGenerate, onGetGenerateFunction]);

  return (
    <div className="p-6 text-white space-y-6">
      <h2 className="text-xl font-bold text-purple-400">
        Angle de caméra
      </h2>

      {/* Upload */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
      />

      {/* Angles */}
      <div className="grid grid-cols-2 gap-3">
        {['close_up', 'wide_shot', '45_left', '45_right', '90_left', '90_right'].map(
          (angle) => (
            <button
              key={angle}
              onClick={() => setSelectedAngle(angle)}
              className={`p-3 rounded-lg border ${
                selectedAngle === angle
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700'
              }`}
            >
              {angle}
            </button>
          )
        )}
      </div>

      {/* Bouton GÉNÉRER ICI */}
      <button
        disabled={!imageFile || !selectedAngle || isGenerating}
        onClick={() => {
          if (imageFile && selectedAngle) {
            onGenerate({ image: imageFile, angle: selectedAngle });
          }
        }}
        className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 py-3 rounded-lg font-bold"
      >
        Générer l’angle
      </button>
    </div>
  );
}
