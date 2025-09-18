'use client';

import { ImageGenerationForm } from "./image-generation-form";


export default function Home() {
  return <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
    <ImageGenerationForm />
  </main>;
}