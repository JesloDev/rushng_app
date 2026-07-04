'use client';

import { useAppStore } from '@/store/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import {
  Store,
  Globe,
  Palette,
  Upload,
  Plus,
  Trash2,
  Eye,
  Save,
  CheckCircle2,
  Sparkles,
  LayoutDashboard,
  ShoppingBag,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { useState } from 'react';

const themeColors = [
  { name: 'Green', value: 'green', color: '#00C853' },
  { name: 'Blue', value: 'blue', color: '#2196F3' },
  { name: 'Purple', value: 'purple', color: '#9C27B0' },
  { name: 'Orange', value: 'orange', color: '#FF9800' },
  { name: 'Rose', value: 'rose', color: '#E91E63' },
  { name: 'Teal', value: 'teal', color: '#009688' },
];

export function MerchantBuilder() {
  const {
    merchantProfile,
    updateMerchantProfile,
    addMerchantProduct,
    removeMerchantProduct,
    updateMerchantProduct,
    setView,
  } = useAppStore();

  const [previewMode, setPreviewMode] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    description: '',
    category: 'General',
    inStock: true,
    image: '',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAddProduct = () => {
    if (newProduct.name.trim()) {
      addMerchantProduct(newProduct);
      setNewProduct({
        name: '',
        price: 0,
        description: '',
        category: 'General',
        inStock: true,
        image: '',
      });
    }
  };

  const currentTheme = themeColors.find((t) => t.value === merchantProfile.theme) || themeColors[0];

  if (previewMode) {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Preview Top Bar */}
        <div className="sticky top-0 z-50 bg-white border-b p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              rushng.com/store/{merchantProfile.slug || merchantProfile.name?.toLowerCase().replace(/\s+/g, '-') || 'my-store'}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(false)}
            className="gap-2"
          >
            <LayoutDashboard className="h-4 w-4" />
            Back to Editor
          </Button>
        </div>

        {/* Store Preview */}
        <div className="mx-auto max-w-4xl p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl bg-white shadow-lg"
          >
            {/* Cover */}
            <div
              className="relative h-48 md:h-64"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.color}, ${currentTheme.color}dd, ${currentTheme.color}99)`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-white/20">
                <Store className="h-32 w-32" />
              </div>
              {merchantProfile.name && (
                <div className="absolute bottom-6 left-6 text-white">
                  <h1 className="text-3xl font-bold drop-shadow-md">
                    {merchantProfile.name}
                  </h1>
                  <p className="text-sm text-white/80">
                    {merchantProfile.category || 'General Store'}
                  </p>
                </div>
              )}
            </div>

            {/* Store Info */}
            <div className="p-6 md:p-8">
              {merchantProfile.description && (
                <p className="mb-6 text-muted-foreground leading-relaxed">
                  {merchantProfile.description}
                </p>
              )}

              <div className="mb-6 flex flex-wrap gap-4">
                {merchantProfile.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {merchantProfile.phone}
                  </div>
                )}
                {merchantProfile.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {merchantProfile.email}
                  </div>
                )}
                {merchantProfile.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {merchantProfile.address}
                  </div>
                )}
              </div>

              <Separator className="mb-6" />

              {/* Products */}
              {merchantProfile.products.length > 0 ? (
                <>
                  <h2 className="mb-4 text-xl font-bold">Our Products</h2>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {merchantProfile.products.map((product, idx) => (
                      <Card key={idx} className="border-0 shadow-sm overflow-hidden">
                        <div
                          className="h-32 flex items-center justify-center"
                          style={{ backgroundColor: `${currentTheme.color}15` }}
                        >
                          <ShoppingBag
                            className="h-12 w-12"
                            style={{ color: `${currentTheme.color}60` }}
                          />
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{product.name}</h3>
                              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                {product.description || 'No description'}
                              </p>
                            </div>
                            <Badge variant={product.inStock ? 'default' : 'secondary'} className="shrink-0 ml-2">
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                          </div>
                          <p
                            className="mt-2 text-lg font-bold"
                            style={{ color: currentTheme.color }}
                          >
                            &#8358;{product.price.toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <ShoppingBag className="mx-auto mb-4 h-12 w-12 opacity-30" />
                  <p>No products added yet. Go back to the editor to add products.</p>
                </div>
              )}

              {/* Footer */}
              <Separator className="my-8" />
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <div
                    className="rounded-md p-1 text-white"
                    style={{ backgroundColor: currentTheme.color }}
                  >
                    <Sparkles className="h-4 w-4" />
                  </div>
                  Powered by RUSHNG
                </div>
                <p className="text-xs text-muted-foreground">
                  Order delivery through RUSHNG for fast and reliable service
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Build Your Store</h1>
              <p className="text-sm text-muted-foreground">
                Create your mini-store website on the RUSHNG platform
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(true)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button
              onClick={handleSave}
              className="gap-2 gradient-rush border-0 text-white"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Store
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Store Settings */}
          <div className="space-y-6 lg:col-span-2">
            {/* Basic Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-orange-500" />
                  Store Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Store Name</Label>
                    <Input
                      placeholder="e.g., Mama Nkechi's Kitchen"
                      value={merchantProfile.name}
                      onChange={(e) => updateMerchantProfile({ name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={merchantProfile.category}
                      onValueChange={(val) => updateMerchantProfile({ category: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Restaurant">Restaurant</SelectItem>
                        <SelectItem value="Grocery">Grocery Store</SelectItem>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Fashion">Fashion & Clothing</SelectItem>
                        <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                        <SelectItem value="Supermarket">Supermarket</SelectItem>
                        <SelectItem value="General">General Store</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Tell your customers about your store..."
                    rows={3}
                    value={merchantProfile.description}
                    onChange={(e) => updateMerchantProfile({ description: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="+234..."
                        className="pl-10"
                        value={merchantProfile.phone}
                        onChange={(e) => updateMerchantProfile({ phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="store@email.com"
                        className="pl-10"
                        value={merchantProfile.email}
                        onChange={(e) => updateMerchantProfile({ email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Store address"
                      className="pl-10"
                      value={merchantProfile.address}
                      onChange={(e) => updateMerchantProfile({ address: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Theme Selection */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-orange-500" />
                  Store Theme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {themeColors.map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => updateMerchantProfile({ theme: theme.value })}
                      className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2 transition-all ${
                        merchantProfile.theme === theme.value
                          ? 'border-foreground scale-105'
                          : 'border-transparent hover:border-muted-foreground/30'
                      }`}
                    >
                      <div
                        className="h-5 w-5 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: theme.color }}
                      />
                      <span className="text-sm font-medium">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Products */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-orange-500" />
                  Products ({merchantProfile.products.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Product Form */}
                <div className="rounded-lg border border-dashed p-4 space-y-4">
                  <p className="text-sm font-medium">Add New Product</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      placeholder="Product name"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Price (₦)"
                      value={newProduct.price || ''}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Select
                      value={newProduct.category}
                      onValueChange={(val) =>
                        setNewProduct({ ...newProduct, category: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Drinks">Drinks</SelectItem>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Clothing">Clothing</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Description (optional)"
                      value={newProduct.description}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, description: e.target.value })
                      }
                    />
                  </div>
                  <Button onClick={handleAddProduct} className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                </div>

                {/* Product List */}
                {merchantProfile.products.length > 0 && (
                  <div className="space-y-3">
                    {merchantProfile.products.map((product, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `${currentTheme.color}15` }}
                          >
                            <ShoppingBag
                              className="h-6 w-6"
                              style={{ color: currentTheme.color }}
                            />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.category}
                              {product.description ? ` - ${product.description}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">
                            &#8358;{product.price.toLocaleString()}
                          </span>
                          <Badge variant={product.inStock ? 'default' : 'secondary'}>
                            {product.inStock ? 'In Stock' : 'Out'}
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeMerchantProduct(idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 bg-orange-50 shadow-sm">
              <CardContent className="p-5">
                <h3 className="mb-2 font-semibold text-orange-800">
                  Your Store URL
                </h3>
                <div className="rounded-lg bg-white p-3 text-sm">
                  <span className="text-muted-foreground">rushng.com/store/</span>
                  <span className="font-semibold">
                    {merchantProfile.name
                      ?.toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[^a-z0-9-]/g, '') || 'my-store'}
                  </span>
                </div>
                <p className="mt-2 text-xs text-orange-700">
                  Share this link with your customers to direct them to your store.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Products</span>
                  <span className="text-sm font-semibold">{merchantProfile.products.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Views this week</span>
                  <span className="text-sm font-semibold">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Orders this month</span>
                  <span className="text-sm font-semibold">89</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Pricing Plans</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border-2 border-orange-500 p-3 text-center">
                  <p className="font-bold text-orange-700">Free Plan</p>
                  <p className="text-2xl font-bold">&#8358;0</p>
                  <p className="text-xs text-muted-foreground">Up to 5 products</p>
                  <Badge className="mt-2">Current</Badge>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="font-bold">Basic Plan</p>
                  <p className="text-2xl font-bold">&#8358;5,000<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                  <p className="text-xs text-muted-foreground">Up to 50 products + analytics</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="font-bold">Premium Plan</p>
                  <p className="text-2xl font-bold">&#8358;15,000<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                  <p className="text-xs text-muted-foreground">Unlimited + featured + ads</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
