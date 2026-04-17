// src/pages/ItemDatabasePage.tsx
import { useState } from "react";
import { ItemDetailModal } from "@/components/items/ItemDetailModal";
import { ItemComparisonDrawer } from "@/components/items/ItemComparisonDrawer";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  fetchCategories,
  fetchItemsByType,
  type ItemType,
  type OpenAlbionItem,
} from "@/api/openalbion";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";
import {
  Sword,
  Shield,
  Backpack,
  FlaskConical,
  Search,
  Filter,
  Star,
  Zap,
  Plus,
} from "lucide-react";


// TYPE_TABS is now generated inside the component with i18n (see TYPE_TABS_I18N)


const TIER_OPTIONS = [
  { value: 0, key: "tierAll" },
  { value: 3, label: "T3" },
  { value: 4, label: "T4" },
  { value: 5, label: "T5" },
  { value: 6, label: "T6" },
  { value: 7, label: "T7" },
  { value: 8, label: "T8" },
];

function getTierColor(tier: string): string {
  const t = parseFloat(tier);
  if (t <= 3) return "text-gray-400 border-gray-400/30 bg-gray-500/10";
  if (t <= 4) return "text-green-400 border-green-400/30 bg-green-500/10";
  if (t <= 5) return "text-blue-400 border-blue-400/30 bg-blue-500/10";
  if (t <= 6) return "text-purple-400 border-purple-400/30 bg-purple-500/10";
  if (t <= 7) return "text-amber-400 border-amber-400/30 bg-amber-500/10";
  return "text-red-400 border-red-400/30 bg-red-500/10";
}

// Generic SVG placeholder — used instead of a wrong random item icon on broken images
const PLACEHOLDER_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" rx="8" fill="%23222"/><path d="M14 34l10-20 10 20H14z" fill="%23555"/></svg>`;

function ItemCard({ 
  item, 
  onCompare, 
  isCompared 
}: { 
  item: OpenAlbionItem;
  onCompare: (item: OpenAlbionItem, e: React.MouseEvent) => void;
  isCompared: boolean;
}) {
  const { t } = useTranslation();
  const tierColor = getTierColor(item.tier);

  return (
    <Card className="group bg-card/50 border-border/40 hover:border-border/60 hover:bg-card/70 transition-colors overflow-hidden cursor-pointer relative">
      <CardContent className="p-3.5">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="relative shrink-0">
            <div className="bg-card/80 p-1.5 rounded-lg border border-border/30 group-hover:border-border/50 transition-colors">
              <img
                src={item.icon}
                alt={item.name}
                className="w-10 h-10 object-contain"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = PLACEHOLDER_SVG;
                }}
              />
            </div>
            <Badge
              className={`absolute -top-1 -right-1 text-[9px] font-semibold px-1 h-4 border ${tierColor}`}
            >
              T{item.tier}
            </Badge>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {item.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400/80" />
                <span className="text-[10px] font-medium text-muted-foreground/70">
                  {item.item_power} IP
                </span>
              </div>
            </div>
          </div>

          {/* Hover actions */}
          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
            <Button
              variant={isCompared ? "default" : "outline"}
              size="icon"
              className={`w-7 h-7 shrink-0 ${isCompared ? 'bg-primary' : 'hover:border-primary/50 hover:text-primary'}`}
              onClick={(e) => onCompare(item, e)}
              title={isCompared ? t("comparison.remove") : t("comparison.add")}
            >
              <Plus className={`w-4 h-4 ${isCompared ? 'rotate-45' : ''} transition-transform`} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ItemDatabasePage() {
  const { t } = useTranslation();
  const [activeType, setActiveType] = useState<ItemType>("weapon");
  const [selectedTier, setSelectedTier] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [detailItem, setDetailItem] = useState<OpenAlbionItem | null>(null);
  const [comparisonList, setComparisonList] = useState<OpenAlbionItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Build TYPE_TABS dynamically with i18n
  const TYPE_TABS_I18N = [
    { type: "weapon" as ItemType, label: t("itemDatabase.tabs.weapon"), icon: Sword },
    { type: "armor" as ItemType, label: t("itemDatabase.tabs.armor"), icon: Shield },
    { type: "accessory" as ItemType, label: t("itemDatabase.tabs.accessory"), icon: Backpack },
    { type: "consumable" as ItemType, label: t("itemDatabase.tabs.consumable"), icon: FlaskConical },
  ];

  const toggleCompare = (item: OpenAlbionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setComparisonList((prev) => {
      if (prev.find((i) => i.id === item.id)) {
        const next = prev.filter((i) => i.id !== item.id);
        if (next.length === 0) {
          setIsDrawerOpen(false);
        }
        return next;
      }
      setIsDrawerOpen(true);
      if (prev.length >= 3) {
        return [...prev.slice(1, 3), item];
      }
      return [...prev, item];
    });
  };

  // Fetch categories
  const categoriesQuery = useQuery({
    queryKey: ["openalbion-categories", activeType],
    queryFn: () => fetchCategories(activeType),
    staleTime: 1000 * 60 * 60, // 1h cache
  });

  // Fetch items
  const itemsQuery = useQuery({
    queryKey: ["openalbion-items", activeType, selectedTier, selectedCategoryId],
    queryFn: () =>
      fetchItemsByType(activeType, {
        tier: selectedTier || undefined,
        category_id: selectedCategoryId,
      }),
    staleTime: 1000 * 60 * 60,
  });

  const items = itemsQuery.data?.data || [];
  const categories = categoriesQuery.data?.data || [];

  // Filter by debounced search — avoids re-rendering on every keystroke
  const filteredItems = debouncedSearch
    ? items.filter((item) =>
        item.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
      )
    : items;

  return (
    <div className="bg-background min-h-screen">
      <SEO title="Item Database" />
      <div className="app-container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2.5 rounded-lg border border-primary/15">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {t("itemDatabase.title")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t("itemDatabase.subtitle")}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <Card className="bg-card/50 border-border/40 backdrop-blur-sm p-2 rounded-lg">
            <div className="flex items-center gap-3 px-3">
              <div className="text-center">
                <div className="text-[10px] font-medium text-muted-foreground/70">
                  {t("itemDatabase.statsItems")}
                </div>
                <div className="text-lg font-bold text-foreground">
                  {items.length}
                </div>
              </div>
              <div className="h-6 w-px bg-border/40" />
              <div className="text-center">
                <div className="text-[10px] font-medium text-muted-foreground/70">
                  {t("itemDatabase.statsType")}
                </div>
                <div className="text-sm font-semibold text-primary capitalize">
                  {TYPE_TABS_I18N.find((tab) => tab.type === activeType)?.label}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Type Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TYPE_TABS_I18N.map((tab) => (
            <Button
              key={tab.type}
              variant={activeType === tab.type ? "default" : "ghost"}
              onClick={() => {
                setActiveType(tab.type);
                setSelectedCategoryId(undefined);
                setSearchQuery("");
              }}
              className={`rounded-lg font-medium text-xs gap-2 h-9 transition-colors ${
                activeType === tab.type
                  ? "shadow-sm"
                  : "hover:bg-muted"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-4">
            {/* Search */}
            <Card className="bg-card/60 border-border/40 backdrop-blur-sm rounded-lg">
              <CardHeader className="pb-2 border-b border-border/20">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Search size={13} className="text-primary/70" />
                  {t("itemDatabase.searchLabel")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("itemDatabase.searchPlaceholder")}
                  className="h-9 bg-background/50 border-border/40"
                />
              </CardContent>
            </Card>

            {/* Tier Filter */}
            <Card className="bg-card/60 border-border/40 backdrop-blur-sm rounded-lg">
              <CardHeader className="pb-2 border-b border-border/20">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Filter size={13} className="text-primary/70" />
                  {t("itemDatabase.tierLabel")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="flex flex-wrap gap-1.5">
                  {TIER_OPTIONS.map((tier) => (
                    <Button
                      key={tier.value}
                      variant={
                        selectedTier === tier.value ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedTier(tier.value)}
                      className={`rounded-md text-[10px] font-medium h-7 px-2 ${
                        selectedTier === tier.value
                          ? ""
                          : "bg-background/50 border-border/40 hover:bg-background/70"
                      }`}
                    >
                      {'key' in tier ? t(`itemDatabase.${tier.key}`) : tier.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            {categories.length > 0 && (
              <Card className="bg-card/60 border-border/40 backdrop-blur-sm rounded-lg">
                <CardHeader className="pb-2 border-b border-border/20">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    {t("itemDatabase.categoryLabel")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-1 max-h-[280px] overflow-y-auto custom-scrollbar">
                  <button
                    onClick={() => setSelectedCategoryId(undefined)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      !selectedCategoryId
                        ? "bg-primary/10 text-primary border border-primary/15"
                        : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    }`}
                  >
                    {t("itemDatabase.categoryAll")}
                  </button>
                  {categories.map((cat) => (
                    <div key={cat.id}>
                      <button
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          selectedCategoryId === cat.id
                            ? "bg-primary/10 text-primary border border-primary/15"
                            : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                        }`}
                      >
                        {cat.name}
                      </button>
                      {cat.subcategories?.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => setSelectedCategoryId(sub.id)}
                          className={`w-full text-left pl-5 pr-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                            selectedCategoryId === sub.id
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground/60 hover:text-foreground hover:bg-background/50"
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </aside>

          {/* Items Grid */}
          <main className="lg:col-span-4">
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-xs font-medium text-muted-foreground/60">
                {t("itemDatabase.itemsFound", { count: filteredItems.length })}
              </p>
            </div>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {itemsQuery.isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))
              ) : filteredItems.length === 0 ? (
                <div className="col-span-full py-10 text-center border border-dashed border-border/40 rounded-lg bg-card/30">
                  <p className="text-sm text-muted-foreground">
                    {t("itemDatabase.emptyMessage")}
                  </p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div key={item.id} onClick={() => setDetailItem(item)}>
                    <ItemCard 
                      item={item} 
                      onCompare={toggleCompare}
                      isCompared={!!comparisonList.find(i => i.id === item.id)}
                    />
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Item Detail Modal */}
      {detailItem && (
        <ItemDetailModal
          item={detailItem}
          itemType={activeType}
          onClose={() => setDetailItem(null)}
        />
      )}

      {/* Floating compare button */}
      {comparisonList.length > 0 && !isDrawerOpen && (
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 px-4 rounded-lg shadow-lg flex items-center gap-2.5 transition-colors"
        >
          <div className="bg-black/15 w-5 h-5 rounded-full flex items-center justify-center font-semibold text-xs">
            {comparisonList.length}
          </div>
          <span className="font-medium text-sm">{t("comparison.compareButton")}</span>
        </button>
      )}

      <ItemComparisonDrawer
        items={comparisonList}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onRemoveItem={(item) => setComparisonList(prev => prev.filter(i => i.id !== item.id))}
      />
    </div>
  );
}




