/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { X, Upload, Image as IconImage } from "lucide-react";
import Image from "next/image";

interface PhotoUploadProps {
  name: string;
  maxPhotos?: number;
  label?: string;
}

interface PhotoItem {
  id: string;
  file?: File;
  preview: string;
  isCover: boolean;
}

export function PhotoUploadForm({ name, maxPhotos = 4, label = "Photo Product" }: PhotoUploadProps) {
  const { control, watch } = useFormContext();
  const [dragActive, setDragActive] = useState(false);

  const fieldValue = watch(name) || [];
  const photos: PhotoItem[] = Array.isArray(fieldValue) ? fieldValue : [];

  // Generate unique ID for each photo
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFiles = useCallback(
    (files: FileList | null, currentPhotos: PhotoItem[]) => {
      if (!files) return currentPhotos;

      const newPhotos = [...currentPhotos];
      const remainingSlots = maxPhotos - newPhotos.length;

      Array.from(files)
        .slice(0, remainingSlots)
        .forEach((file) => {
          if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const preview = e.target?.result as string;
              newPhotos.push({
                id: generateId(),
                file,
                preview,
                isCover: newPhotos.length === 0, // First photo is cover by default
              });
            };
            reader.readAsDataURL(file);
          }
        });

      return newPhotos;
    },
    [maxPhotos],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, onChange: any) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const newPhotos = processFiles(e.dataTransfer.files, photos);
      onChange(newPhotos);
    },
    [photos, processFiles],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, onChange: any) => {
      const newPhotos = processFiles(e.target.files, photos);
      onChange(newPhotos);
      e.target.value = ""; // Reset input
    },
    [photos, processFiles],
  );

  const removePhoto = useCallback(
    (id: string, onChange: any) => {
      const updated = photos.filter((p) => p.id !== id);
      // Ensure at least one cover photo
      if (updated.length > 0 && !updated.some((p) => p.isCover)) {
        updated[0].isCover = true;
      }
      onChange(updated);
    },
    [photos],
  );

  const setAsCover = useCallback(
    (id: string, onChange: any) => {
      const updated = photos.map((p) => ({
        ...p,
        isCover: p.id === id,
      }));
      onChange(updated);
    },
    [photos],
  );

  const replacePhoto = useCallback(
    (id: string, onChange: any) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file && file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (readEvent) => {
            const preview = readEvent.target?.result as string;
            const updated = photos.map((p) => (p.id === id ? { ...p, file, preview } : p));
            onChange(updated);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    },
    [photos],
  );

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={[]}
      render={({ field: { onChange } }) => (
        <div className="w-full">
          <h2 className="text-lg font-semibold mb-4">{label}</h2>

          <div className="flex flex-wrap gap-4">
            {/* Upload Area */}
            {photos.length < maxPhotos && (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={(e) => handleDrop(e, onChange)}
                className={`relative w-[250px] h-[250px] rounded-lg border border-dashed transition-colors border-brand-400 ${
                  dragActive ? "border-primary bg-primary/5" : "border-border bg-muted/30"
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileInput(e, onChange)}
                  className="hidden"
                  id={`photo-input-${name}`}
                />

                <label htmlFor={`photo-input-${name}`} className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                  <IconImage className="w-8 h-8 text-muted-foreground mb-2" color="var(--color-brand-500)" />
                  <div className="text-center text-sm ">
                    <p className=" text-brand-500 font-semibold">Click to Upload</p>
                    <p className="text-muted-foreground">or Drag and drop</p>
                  </div>
                </label>
              </div>
            )}

            {/* Photo Grid */}
            {photos.map((photo) => (
              <div key={photo.id} className="relative w-[250px] h-[250px] rounded-lg overflow-hidden group">
                <Image src={photo.preview || "/placeholder.svg"} alt="Product photo" fill className="object-cover" />

                {/* Cover Badge */}
                {photo.isCover && <div className="absolute bottom-2 right-2 bg-teal-600 text-white px-2 py-1 rounded text-xs font-medium">COVER</div>}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => replacePhoto(photo.id, onChange)}
                    className="bg-white text-primary hover:bg-white/90"
                  >
                    Replace
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => removePhoto(photo.id, onChange)}
                    className="bg-white text-primary hover:bg-white/90"
                  >
                    Remove
                  </Button>
                  {!photo.isCover && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setAsCover(photo.id, onChange)}
                      className="bg-white text-primary hover:bg-white/90"
                    >
                      Set as Cover
                    </Button>
                  )}
                </div>

                {/* Quick Remove Button */}
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id, onChange)}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove photo"
                >
                  <X className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>

          {/* Info Text */}
          <p className="text-sm text-muted-foreground mt-4">
            {photos.length}/{maxPhotos} photos uploaded
          </p>
        </div>
      )}
    />
  );
}
