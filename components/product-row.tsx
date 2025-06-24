"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProductRowProps {
  product: {
    id: string;
    code: string;
    farfetchId: string;
    barcode: string;
    categories: string[];
    season: string;
    merchandisingClass: string;
    gender: string;
    assetType: string[];
    status: string;
    shootingName: string; // Ensure shootingName is included if used
    images: {
      id: string;
      status: string; // Image status
      url: string;
      type: string;
    }[];
  };
  selectedImages: { [key: string]: boolean };
  onToggleSelect: (imageId: string) => void;
  onSelectAll: () => void;
  // Updated signature to pass image status and ID
  onViewImage: (
    url: string,
    type: string,
    status: string,
    id: string,
    notes: string,
    comments: string
  ) => void;
}

// Function to get color based on product status
const getColorForStatus = (status: string): string => {
  switch (status) {
    case "SHOT":
      return "bg-red-500";
    case "IN PROGRESS":
      return "bg-orange-500";
    case "APPROVED":
      return "bg-green-500";
    case "DELIVERED":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
};

export default function ProductRow({
  product,
  selectedImages,
  onToggleSelect,
  onSelectAll,
  onViewImage,
}: ProductRowProps) {
  const allSelected = product.images.every((img) => selectedImages[img.id]);
  // Note: The `statusColor` is currently based on `product.status`.
  // If you intend to show image-specific status color, you'll need to adapt this
  // to be displayed for each image in the map function.
  const statusColor = getColorForStatus(product.status);

  return (
    <div className="bg-white border rounded-md overflow-hidden shadow-sm">
      <div className="bg-muted/30 p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant={allSelected ? "default" : "outline"}
            size="sm"
            onClick={onSelectAll}
          >
            {allSelected ? "Deselect All" : "Select All"}
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{product.code}</span>
          <span className="text-muted-foreground">|</span>
          <span className="font-medium">{product?.season}</span>
          <span className="text-muted-foreground">|</span>
          <span className="font-medium">{product.shootingName}</span>
        </div>
      </div>

      <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {product.images.map((image) => (
          <div
            key={image.id}
            className={`border rounded-md overflow-hidden relative group cursor-pointer transition-all ${
              selectedImages[image.id] ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => onToggleSelect(image.id)}
            // Pass image.url, image.type, image.status, and image.id
            onDoubleClick={() =>
              onViewImage(image.url, image.type, image.status, image.id)
            }
          >
            <div className="aspect-square relative">
              <Image
                src={image.url || "/placeholder.svg"}
                alt={`Product ${product.code}`}
                fill
                className="object-cover"
              />

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 bg-white/80 hover:bg-white"
                        // Prevent the parent div's onClick (for selection) from firing
                        // when the view button is clicked.
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewImage(
                            image.url,
                            image.type,
                            image.status,
                            image.id,
                            image.notes,
                            image.comments
                          ); // Pass notes and comments
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View image</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="p-1 flex justify-between items-center bg-muted/10 text-xs">
              <div className="truncate max-w-full">{product.code}</div>
              {/* If you want to show image-specific status, you'd add it here */}
              <div
                className={`px-1 rounded-sm text-white text-[10px] ${getColorForStatus(
                  image.status
                )}`}
              >
                {image.status}
              </div>
            </div>

            {/* Colored bar based on product status (if you want product-level status bar) */}
            {/* If you want image-specific status bar, move this inside the image map and use image.status */}
            <div className={`h-1 w-full ${statusColor}`}></div>
          </div>
        ))}
      </div>

      <div className="bg-muted/10 p-2 text-xs flex flex-wrap gap-2">
        <div>
          <span className="font-medium">Farfetch ID:</span> {product.farfetchId}
        </div>
        <div>
          <span className="font-medium">Barcode:</span> {product.barcode}
        </div>
        <div>
          <span className="font-medium">Gender:</span> {product.gender}
        </div>
        <div>
          <span className="font-medium">Merchandising Class:</span>{" "}
          {product.merchandisingClass}
        </div>
        <div>
          <span className="font-medium">Asset Types:</span>{" "}
          {product.assetType.join(", ")}
        </div>
      </div>
    </div>
  );
}
