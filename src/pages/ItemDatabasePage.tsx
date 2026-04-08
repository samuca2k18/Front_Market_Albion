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
    <Card className="group bg-card/30 border-border/40 hover:border-primary/40 hover:bg-card/60 transition-all duration-300 overflow-hidden cursor-pointer shadow-lg hover:shadow-xl hover:shadow-primary/5 relative">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="relative shrink-0">
            <div className="bg-black/40 p-2 rounded-xl border border-border/30 group-hover:scale-110 group-hover:border-primary/30 transition-all duration-300">
              <img
                src={item.icon}
                alt={item.name}
                className="w-12 h-12 object-contain"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = PLACEHOLDER_SVG;
                }}
              />
            </div>
            <Badge
              className={`absolute -top-1 -right-1 text-[9px] font-black px-1 h-4 border ${tierColor}`}
            >
              T{item.tier}
            </Badge>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
              {item.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] font-bold text-muted-foreground">
                  {item.item_power} IP
                </span>
              </div>
            </div>
          </div>

          {/* Hover actions */}
          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 ml-auto">
            <Button
              variant={isCompared ? "default" : "outline"}
              size="icon"
              className={`w-7 h-7 shrink-0 ${isCompared ? 'bg-primary' : 'hover:border-primary hover:text-primary'}`}
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
      <div className="app-container py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-4 rounded-3xl shadow-lg shadow-primary/15 border border-primary/20">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tighter uppercase leading-none mb-1">
                  {t("itemDatabase.title")}
                </h1>
                <p className="text-muted-foreground font-medium">
                  {t("itemDatabase.subtitle")}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <Card className="bg-card/40 border-border/40 backdrop-blur-md p-2 rounded-2xl shadow-xl">
            <div className="flex items-center gap-4 px-4">
              <div className="text-center">
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {t("itemDatabase.statsItems")}
                </div>
                <div className="text-xl font-black tracking-tighter text-foreground">
                  {items.length}
                </div>
              </div>
              <div className="h-8 w-px bg-border/40" />
              <div className="text-center">
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {t("itemDatabase.statsType")}
                </div>
                <div className="text-sm font-bold text-primary capitalize">
                  {TYPE_TABS_I18N.find((tab) => tab.type === activeType)?.label}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Type Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TYPE_TABS_I18N.map((tab) => (
            <Button
              key={tab.type}
              variant={activeType === tab.type ? "default" : "ghost"}
              onClick={() => {
                setActiveType(tab.type);
                setSelectedCategoryId(undefined);
                setSearchQuery("");
              }}
              className={`rounded-xl font-bold uppercase tracking-widest text-xs gap-2 h-10 transition-all ${
                activeType === tab.type
                  ? "shadow-lg shadow-primary/20"
                  : "hover:bg-card/40"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Search */}
            <Card className="bg-card/40 border-border/40 backdrop-blur-md shadow-lg rounded-2xl">
              <CardHeader className="pb-3 border-b border-border/20">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Search size={14} className="text-primary" />
                  {t("itemDatabase.searchLabel")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("itemDatabase.searchPlaceholder")}
                  className="h-10 bg-background/40 border-border/40 focus:border-primary/50"
                />
              </CardContent>
            </Card>

            {/* Tier Filter */}
            <Card className="bg-card/40 border-border/40 backdrop-blur-md shadow-lg rounded-2xl">
              <CardHeader className="pb-3 border-b border-border/20">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Filter size={14} className="text-primary" />
                  {t("itemDatabase.tierLabel")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-2">
                  {TIER_OPTIONS.map((tier) => (
                    <Button
                      key={tier.value}
                      variant={
                        selectedTier === tier.value ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedTier(tier.value)}
                      className={`rounded-lg text-[10px] font-black uppercase tracking-widest h-8 ${
                        selectedTier === tier.value
                          ? ""
                          : "bg-background/40 border-border/40 hover:bg-background/60"
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
              <Card className="bg-card/40 border-border/40 backdrop-blur-md shadow-lg rounded-2xl">
                <CardHeader className="pb-3 border-b border-border/20">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    {t("itemDatabase.categoryLabel")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                  <button
                    onClick={() => setSelectedCategoryId(undefined)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      !selectedCategoryId
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:bg-background/40 hover:text-foreground"
                    }`}
                  >
                    {t("itemDatabase.categoryAll")}
                  </button>
                  {categories.map((cat) => (
                    <div key={cat.id}>
                      <button
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                          selectedCategoryId === cat.id
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "text-muted-foreground hover:bg-background/40 hover:text-foreground"
                        }`}
                      >
                        {cat.name}
                      </button>
                      {cat.subcategories?.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => setSelectedCategoryId(sub.id)}
                          className={`w-full text-left pl-6 pr-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                            selectedCategoryId === sub.id
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground/60 hover:text-foreground hover:bg-background/40"
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
            <div className="flex items-center justify-between mb-4 px-1">
              <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 italic">
                {t("itemDatabase.itemsFound", { count: filteredItems.length })}
              </p>
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {itemsQuery.isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-2xl" />
                ))
              ) : filteredItems.length === 0 ? (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-border/40 rounded-3xl bg-card/20">
                  <p className="text-muted-foreground font-bold">
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
          className="fixed bottom-6 right-6 z-40 bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-full shadow-2xl flex items-center gap-3 transition-transform hover:scale-105 animate-bounce px-4"
        >
          <div className="bg-black/20 w-6 h-6 rounded-full flex items-center justify-center font-black text-xs">
            {comparisonList.length}
          </div>
          <span className="font-bold text-sm tracking-tighter">{t("comparison.compareButton")}</span>
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




