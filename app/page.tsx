// 'use client';

// import { ImageGenerationForm } from "./image-generation-form";


// export default function Home() {
//   return <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
//     <ImageGenerationForm />
//   </main>;
// }
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function ImageGeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Call your backend function here
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: 'random' }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const { imageUrl } = await response.json();
      setGeneratedImage(imageUrl);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <h1 className="text-4xl p-1 font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Random Image Generator
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Generate beautiful random images with a single click
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          {/* Generate Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center"
          >
            <Button
              onClick={handleGenerateImage}
              disabled={isGenerating}
              size="lg"
              className="relative px-8 py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 dark:from-purple-500 dark:to-pink-500 dark:hover:from-purple-600 dark:hover:to-pink-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </motion.div>
                ) : (
                  <motion.div
                    key="generate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Generate Image
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8"
              >
                <Card className="border-red-200 dark:border-red-800">
                  <CardContent className="p-4">
                    <p className="text-red-600 dark:text-red-400 text-center">
                      {error}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading Animation */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-8"
              >
                <Card className="border-dashed border-2 border-purple-300 dark:border-purple-600">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 180, 360],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"
                      />
                      <p className="text-slate-600 dark:text-slate-400">
                        Creating your image...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generated Image */}
          <AnimatePresence>
            {generatedImage && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <Card className="overflow-hidden shadow-xl border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="relative group">
                      <motion.div
                        className="relative overflow-hidden rounded-lg"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Image
                          src={generatedImage}
                          alt="Generated image"
                          width={512}
                          height={512}
                          className="w-full h-auto rounded-lg shadow-lg"
                          priority
                        />

                        {/* Overlay with download button */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-start justify-end p-4 rounded-lg"
                        >
                          <Button
                            onClick={downloadImage}
                            variant="secondary"
                            size="sm"
                            className="bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Image info */}
                    <div className="mt-4 text-center">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Generated on {new Date().toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
