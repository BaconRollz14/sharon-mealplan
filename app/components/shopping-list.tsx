"use client";

import { FormEvent, memo, useRef, useState } from "react";
import {
  Check,
  CirclePoundSterling,
  ListChecks,
  MoreHorizontal,
  Plus,
  Share2,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ShoppingItem, WeekPlan } from "../cookbook-data";
import { FreshnessPanel } from "./freshness-panel";
import type { PurchasedLot, ScheduleEvaluation } from "../freshness-planner";
import { money, normalisePriceDate, shoppingItemKey, slugify } from "../planner-utils";

export interface ExtraShoppingItem {
  id: string;
  name: string;
  amount: string;
  price: number;
  priceKnown?: boolean;
  category: string;
  carriedForward?: boolean;
}

interface ShoppingListProps {
  week: WeekPlan;
  checkedItems: Set<string>;
  shoppingCategories: Record<string, string>;
  extraItems?: ExtraShoppingItem[];
  showRemaining: boolean;
  priceBasis: string;
  canUndo?: boolean;
  onToggleItem: (key: string) => void;
  onMoveItem: (key: string, itemName: string, category: string) => void;
  onMoveExtraItem?: (id: string, category: string) => void;
  onAddExtraItem?: (item: Omit<ExtraShoppingItem, "id"> & { id?: string }) => void;
  onRemoveExtraItem?: (id: string) => void;
  onClearChecked: () => void;
  onUndo?: () => void;
  onShowRemainingChange: (show: boolean) => void;
  weekStartISO?: string;
  freshnessLots?: PurchasedLot[];
  freshnessEvaluation?: ScheduleEvaluation;
  onAddFreshnessLot?: (lot: PurchasedLot) => void;
  onUpdateFreshnessLot?: (lot: PurchasedLot) => void;
  onRemoveFreshnessLot?: (lotId: string) => void;
  onOptimiseFreshness?: () => void;
  onShare?: () => void;
}

type DisplayItem = {
  item: ShoppingItem | ExtraShoppingItem;
  sectionTitle: string;
  key: string;
  isExtra: boolean;
};

export const ShoppingList = memo(function ShoppingList({
  week,
  checkedItems,
  shoppingCategories,
  extraItems = [],
  showRemaining,
  priceBasis,
  canUndo = false,
  onToggleItem,
  onMoveItem,
  onMoveExtraItem = () => {},
  onAddExtraItem = () => {},
  onRemoveExtraItem = () => {},
  onClearChecked,
  onUndo = () => {},
  onShowRemainingChange,
  weekStartISO = "",
  freshnessLots = [],
  freshnessEvaluation = { feasible: true, issues: [], allocations: [], order: [] },
  onAddFreshnessLot = () => {},
  onUpdateFreshnessLot = () => {},
  onRemoveFreshnessLot = () => {},
  onOptimiseFreshness = () => {},
  onShare,
}: ShoppingListProps) {
  const [basketOpen, setBasketOpen] = useState(false);
  const [extraFormOpen, setExtraFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [extraName, setExtraName] = useState("");
  const [extraAmount, setExtraAmount] = useState("");
  const [extraPrice, setExtraPrice] = useState("");
  const [extraCategory, setExtraCategory] = useState(week.shopping[0]?.title ?? "Other");
  const [extraCarriedForward, setExtraCarriedForward] = useState(false);
  const [extraError, setExtraError] = useState("");
  const [extraErrorField, setExtraErrorField] = useState<"name" | "price" | null>(null);
  const extraNameRef = useRef<HTMLInputElement | null>(null);
  const extraPriceRef = useRef<HTMLInputElement | null>(null);

  const categoryTitles = week.shopping.map((section) => section.title);
  const allItems: DisplayItem[] = [
    ...week.shopping.flatMap((section) =>
      section.items.map((item) => ({
        item,
        sectionTitle: section.title,
        key: shoppingItemKey(week.number, section.title, item),
        isExtra: false,
      })),
    ),
    ...extraItems.map((item) => ({
      item,
      sectionTitle: item.category,
      key: `extra-w${week.number}-${item.id}`,
      isExtra: true,
    })),
  ];
  const pickedCount = allItems.filter(({ key }) => checkedItems.has(key)).length;
  const allPicked = allItems.length > 0 && pickedCount === allItems.length;
  const pricedExtras = extraItems.filter((item) => !item.carriedForward && (item.priceKnown ?? item.price > 0) && Number.isFinite(item.price) && item.price >= 0);
  const unknownExtras = extraItems.filter((item) => !item.carriedForward && !(item.priceKnown ?? item.price > 0));
  const extrasTotal = pricedExtras.reduce((total, item) => total + item.price, 0);
  const estimatedCheckoutTotal = Math.round((week.checkoutTotal + extrasTotal) * 100) / 100;
  const estimatedBufferedTotal = Math.round((estimatedCheckoutTotal * 1.1) * 100) / 100;

  const visibleSections = categoryTitles
    .map((title) => ({
      title,
      items: allItems.filter(({ key, sectionTitle, item }) => {
        const selectedCategory = "category" in item
          ? sectionTitle
          : (categoryTitles.includes(shoppingCategories[key]) ? shoppingCategories[key] : sectionTitle);
        return selectedCategory === title && (!showRemaining || !checkedItems.has(key));
      }),
    }))
    .filter((section) => section.items.length > 0);

  const resetExtraForm = () => {
    setExtraFormOpen(false);
    setEditingId(null);
    setExtraName("");
    setExtraAmount("");
    setExtraPrice("");
    setExtraCategory(categoryTitles[0] ?? "Other");
    setExtraCarriedForward(false);
    setExtraError("");
    setExtraErrorField(null);
  };

  const startEditing = (item: ExtraShoppingItem) => {
    setEditingId(item.id);
    setExtraFormOpen(true);
    setExtraName(item.name);
    setExtraAmount(item.amount);
    setExtraPrice(item.carriedForward ? "" : String(item.price));
    setExtraCategory(item.category);
    setExtraCarriedForward(Boolean(item.carriedForward));
  };

  const submitExtra = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = extraName.trim();
    if (!name) {
      setExtraErrorField("name");
      setExtraError("Enter an item name.");
      window.requestAnimationFrame(() => extraNameRef.current?.focus());
      return;
    }
    const rawPrice = extraPrice.trim();
    const parsedPrice = Number(rawPrice);
    if (!extraCarriedForward && rawPrice && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
      setExtraErrorField("price");
      setExtraError("Enter a price of £0 or more, or leave it blank until you know it.");
      window.requestAnimationFrame(() => extraPriceRef.current?.focus());
      return;
    }
    onAddExtraItem({
      id: editingId ?? undefined,
      name,
      amount: extraAmount.trim() || "As needed",
      price: extraCarriedForward ? 0 : Math.max(0, parsedPrice || 0),
      priceKnown: extraCarriedForward || Boolean(rawPrice),
      category: categoryTitles.includes(extraCategory) ? extraCategory : categoryTitles[0] ?? "Other",
      carriedForward: extraCarriedForward,
    });
    resetExtraForm();
  };

  return (
    <div className="shopping-view">
      <h3 className="sr-only">Week {week.number} shopping list</h3>

      <div className="shopping-tools" aria-label="Shopping list tools">
        <p className="shopping-progress" aria-live="polite">{allPicked ? "That\u2019s the lot. Everything is picked." : `${pickedCount} of ${allItems.length} picked`}</p>
        <label className="compact-switch" htmlFor="remaining-items-switch">
          <Switch id="remaining-items-switch" checked={showRemaining} onCheckedChange={onShowRemainingChange} />
          <span>Show remaining only</span>
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="button button-secondary shopping-more" aria-label="More shopping actions"><MoreHorizontal aria-hidden="true" /><span>More</span></button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="shopping-action-menu">
            <DropdownMenuItem onSelect={() => setExtraFormOpen((open) => !open)}>
              {extraFormOpen ? <X aria-hidden="true" /> : <Plus aria-hidden="true" />}{extraFormOpen ? "Close add item" : "Add item"}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onClearChecked} disabled={!pickedCount}><Trash2 aria-hidden="true" />Clear checked</DropdownMenuItem>
            {canUndo ? <DropdownMenuItem onSelect={onUndo}><Undo2 aria-hidden="true" />Undo</DropdownMenuItem> : null}
            {onShare ? <DropdownMenuItem onSelect={onShare}><Share2 aria-hidden="true" />Share progress</DropdownMenuItem> : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {extraFormOpen ? (
        <form className="extra-shopping-form" onSubmit={submitExtra}>
          <div className="extra-shopping-form-heading"><strong>{editingId ? "Edit extra item" : "Add something to this shop"}</strong><span>Extras count towards this week&apos;s shop total.</span>{extraError ? <p id={`extra-shopping-error-w${week.number}`} className="form-error" role="alert">{extraError}</p> : null}</div>
          <label htmlFor={`extra-name-w${week.number}`}>Item<input ref={extraNameRef} id={`extra-name-w${week.number}`} value={extraName} onChange={(event) => setExtraName(event.target.value)} placeholder="e.g. Lunchbox fruit" required aria-invalid={extraErrorField === "name" || undefined} aria-describedby={extraError ? `extra-shopping-error-w${week.number}` : undefined} /></label>
          <label htmlFor={`extra-amount-w${week.number}`}>Amount<input id={`extra-amount-w${week.number}`} value={extraAmount} onChange={(event) => setExtraAmount(event.target.value)} placeholder="e.g. 6 pieces" /></label>
          <label htmlFor={`extra-price-w${week.number}`}>Price<input ref={extraPriceRef} id={`extra-price-w${week.number}`} inputMode="decimal" value={extraPrice} onChange={(event) => setExtraPrice(event.target.value)} placeholder="£0.00" disabled={extraCarriedForward} aria-invalid={extraErrorField === "price" || undefined} aria-describedby={extraError ? `extra-shopping-error-w${week.number}` : undefined} /></label>
          <label htmlFor={`extra-category-w${week.number}`}>Section<select id={`extra-category-w${week.number}`} value={extraCategory} onChange={(event) => setExtraCategory(event.target.value)}>{categoryTitles.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label className="extra-owned-check"><input type="checkbox" checked={extraCarriedForward} onChange={(event) => setExtraCarriedForward(event.target.checked)} />Already have it</label>
          <div className="extra-shopping-form-actions"><button type="submit" className="button button-primary">{editingId ? "Save item" : "Add item"}</button><button type="button" className="button button-secondary" onClick={resetExtraForm}>Cancel</button></div>
        </form>
      ) : null}

      <div className="shopping-layout">
        <div>
          {visibleSections.length ? (
            <div className="shopping-sections">
              {visibleSections.map((section) => {
                const sectionId = `shopping-section-w${week.number}-${slugify(section.title)}`;
                const sectionDone = section.items.every(({ key }) => checkedItems.has(key));
                return (
                  <section className={`shopping-section${sectionDone ? " is-done" : ""}`} key={section.title} aria-labelledby={sectionId}>
                    <h4 id={sectionId}>{section.title}{sectionDone ? <span className="shopping-section-done"><Check aria-hidden="true" />Done</span> : null}</h4>
                    <ul>
                      {section.items.map(({ item, key, isExtra }) => {
                        const checked = checkedItems.has(key);
                        const inputId = `shopping-${key}`;
                        const extraItem = isExtra ? item as ExtraShoppingItem : null;
                        return (
                          <li key={key}>
                            <div className="shopping-item-row">
                              <label className={`shopping-item${checked ? " is-checked" : ""}`} htmlFor={inputId}>
                                <Checkbox
                                  id={inputId}
                                  checked={checked}
                                  onCheckedChange={() => onToggleItem(key)}
                                  aria-label={`${item.name}, ${item.amount}, ${item.carriedForward ? "already on hand" : (("priceKnown" in item && item.priceKnown) || item.price > 0) ? money.format(item.price) : "price to confirm"}`}
                                />
                                <span className="shopping-item-name"><strong>{item.name}{isExtra ? <small className="extra-item-badge">Added</small> : null}</strong><small>{item.amount}</small></span>
                                <span className={`shopping-item-price${item.carriedForward ? " is-carried" : ""}`}>{item.carriedForward ? "On hand" : (("priceKnown" in item && item.priceKnown) || item.price > 0) ? money.format(item.price) : "Price tbc"}</span>
                              </label>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button type="button" className="shopping-item-move" aria-label={`${isExtra ? "Edit or move" : "Move"} ${item.name} to another category`}>
                                    <MoreHorizontal aria-hidden="true" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="shopping-category-menu">
                                  <DropdownMenuLabel>{isExtra ? "Item actions" : "Move to"}</DropdownMenuLabel>
                                  {isExtra ? <>
                                    <DropdownMenuItem onSelect={() => extraItem && startEditing(extraItem)}>Edit item</DropdownMenuItem>
                                    <DropdownMenuItem className="is-danger" onSelect={() => extraItem && onRemoveExtraItem(extraItem.id)}>Remove item</DropdownMenuItem>
                                  </> : null}
                                  <DropdownMenuRadioGroup value={section.title} onValueChange={(category) => isExtra && extraItem ? onMoveExtraItem(extraItem.id, category) : onMoveItem(key, item.name, category)}>
                                    {categoryTitles.map((category) => (
                                      <DropdownMenuRadioItem key={category} value={category}>{category}</DropdownMenuRadioItem>
                                    ))}
                                  </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="shopping-complete" role="status">
              <ListChecks aria-hidden="true" />
              <div><strong>That&apos;s the lot</strong><p>Every item for Week {week.number} is checked.</p></div>
            </div>
          )}
        </div>

        <section className={`basket-summary${basketOpen ? " is-open" : ""}`} aria-label="Shop total">
          <button type="button" className="basket-summary-toggle" aria-expanded={basketOpen} aria-controls={`basket-summary-details-w${week.number}`} onClick={() => setBasketOpen((open) => !open)}>
            <span>{allPicked ? "That\u2019s the lot" : `${pickedCount} of ${allItems.length} picked`}</span>
            <strong>{money.format(estimatedCheckoutTotal)}</strong>
          </button>
          <div className="basket-summary-details" id={`basket-summary-details-w${week.number}`}>
            <div className="summary-icon"><ListChecks aria-hidden="true" /></div>
            <strong>{money.format(estimatedCheckoutTotal)}</strong>
            <p>Shop total: complete packs plus priced extras.</p>
            {unknownExtras.length ? <p className="summary-warning" role="status">{unknownExtras.length} extra {unknownExtras.length === 1 ? "item needs" : "items need"} a price.</p> : null}
            <div className="summary-rule" />
            <span><CirclePoundSterling aria-hidden="true" />{money.format(estimatedBufferedTotal)} with 10% allowance</span>
            <details className="price-disclosure">
              <summary>About these prices</summary>
              <p>Prices checked {normalisePriceDate(week.priceChecked)}. {priceBasis}</p>
            </details>
          </div>
        </section>
      </div>

      <FreshnessPanel
        week={week}
        weekStartISO={weekStartISO}
        lots={freshnessLots}
        evaluation={freshnessEvaluation}
        onAddLot={onAddFreshnessLot}
        onUpdateLot={onUpdateFreshnessLot}
        onRemoveLot={onRemoveFreshnessLot}
        onOptimise={onOptimiseFreshness}
      />
    </div>
  );
});
