import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useImageUpload } from "./use-image-upload"
import { ImagePlus, X, Upload, Trash2 } from "lucide-react"
import { useCallback, useState } from "react"
import { cn } from "@/lib/utils"

export function ImageUploadDemo() {
    const {
        previewUrl,
        fileName,
        fileInputRef,
        handleThumbnailClick,
        handleFileChange,
        handleRemove,
    } = useImageUpload({
        onUpload: (url) => console.log("Uploaded image URL:", url),
    })

    const [isDragging, setIsDragging] = useState(false)

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragging(false)

            const file = e.dataTransfer.files?.[0]
            if (file && (file.type.startsWith("image/") || file.type === "application/pdf")) {
                const fakeEvent = {
                    target: {
                        files: [file],
                    },
                } as unknown as React.ChangeEvent<HTMLInputElement>
                handleFileChange(fakeEvent)
            }
        },
        [handleFileChange],
    )

    return (
        <div className="w-full space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Upload File</h3>
                <p className="text-sm text-gray-500">
                    Supported formats: PDF, JPG, PNG, GIF
                </p>
            </div>

            <Input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            {!previewUrl ? (
                <div
                    onClick={handleThumbnailClick}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        "flex h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100",
                        isDragging && "border-[#d63384] bg-pink-50",
                    )}
                >
                    <div className="rounded-full bg-white p-3 shadow-sm border border-gray-100">
                        <ImagePlus className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium">Click to select</p>
                        <p className="text-xs text-gray-500">
                            or drag and drop file here
                        </p>
                    </div>
                </div>
            ) : (
                <div className="relative">
                    <div className="group relative h-64 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                        {fileName?.toLowerCase().endsWith('.pdf') ? (
                            <div className="flex flex-col items-center justify-center text-gray-500">
                                <ImagePlus className="h-12 w-12 mb-2 opacity-50" />
                                <p className="text-sm font-medium">PDF Document Selected</p>
                                <p className="text-xs truncate max-w-[200px]">{fileName}</p>
                            </div>
                        ) : (
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        )}

                        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={handleThumbnailClick}
                                className="h-9 w-9 p-0"
                            >
                                <Upload className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={handleRemove}
                                className="h-9 w-9 p-0"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    {fileName && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                            <span className="truncate">{fileName}</span>
                            <button
                                onClick={handleRemove}
                                className="ml-auto rounded-full p-1 hover:bg-gray-200"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
