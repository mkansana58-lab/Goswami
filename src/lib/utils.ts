import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resizes an image file to a maximum dimension and returns a data URL.
 * For non-image files, it just converts to data URL if under 1MB.
 */
export const fileToDataUrl = (file: File, maxSize: number = 800): Promise<string> => {
    const firestoreLimit = 1048487; // Firestore field size limit in bytes

    // Handle non-image files
    if (!file.type.startsWith('image/')) {
        if (file.size > firestoreLimit) {
            return Promise.reject(new Error("File size exceeds 1MB limit."));
        }
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Handle image files
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (!event.target?.result) {
                return reject(new Error("Failed to read file."));
            }
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let { width, height } = img;

                if (width > height) {
                    if (width > maxSize) {
                        height = Math.round(height * (maxSize / width));
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = Math.round(width * (maxSize / height));
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    return reject(new Error("Could not get canvas context."));
                }
                ctx.drawImage(img, 0, 0, width, height);
                
                const dataUrl = canvas.toDataURL(file.type, 0.9);
                if (dataUrl.length > firestoreLimit) {
                    // This is a fallback, should be rare with resizing
                    console.warn("Resized image still exceeds Firestore limit. Try a smaller maxSize.");
                }
                resolve(dataUrl);
            };
            img.onerror = reject;
            img.src = event.target.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};
