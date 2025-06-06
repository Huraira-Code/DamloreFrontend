import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProductItemProps {
  product: {
    id: string
    code: string
    categories: string[]
    season: string
    gender: string
    imageUrl: string
  }
  isSelected: boolean
  onToggleSelect: () => void
}

export default function ProductItem({ product, isSelected, onToggleSelect }: ProductItemProps) {
  return (
    <Card className={`overflow-hidden transition-all ${isSelected ? "ring-2 ring-primary" : ""}`}>
      <div className="relative">
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelect}
            className="h-5 w-5 bg-background/90 border-muted-foreground"
          />
        </div>
        <div className="aspect-square relative">
          <Image
            src={product.imageUrl || "/placeholder.svg"}
            alt={`Product ${product.code}`}
            fill
            className="object-cover"
          />
        </div>
      </div>
      <CardContent className="p-4">
        <div className="grid gap-2">
          <div className="font-medium">{product.code}</div>
          <div className="flex flex-wrap gap-1">
            {product.categories.map((category, index) => (
              <Badge key={`${product.id}-${index}`} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between text-sm text-muted-foreground">
        <div>Season: {product.season}</div>
        <div>Gender: {product.gender}</div>
      </CardFooter>
    </Card>
  )
}
