import { useEffect } from 'react';

export function CameraAnglesGenerator({
  onGenerate,
  onGetGenerateFunction,
  isGenerating,
}: {
  onGenerate: (params: any) => void;
  onGetGenerateFunction: (fn: () => void) => void;
  isGenerating: boolean;
}) {

  useEffect(() => {
    onGetGenerateFunction(() => {
      if (isGenerating) return;

      // 👇 TEST DIRECT
      onGenerate({
        angle: 'close_up',
      });
    });
  }, [onGenerate, onGetGenerateFunction, isGenerating]);

  return (
    <div className="p-6 text-white">
      <h2 className="text-xl font-bold text-purple-400">Angles de caméra</h2>
      <p className="text-gray-300 mt-2">
        Test : clique sur Générer → close_up
      </p>
    </div>
  );
}
